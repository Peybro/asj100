"use client";

import Image from "next/image";
import asj100 from "/public/100JahreASJLogo_RGB_4zu3.png";
import { MouseEvent, useState } from "react";
import Link from "next/link";
import { ref as storageRef } from "firebase/storage";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "@/firebase-config";
import { useUploadFile } from "react-firebase-hooks/storage";
import DatenschutzhinweisComponent from "@/components/Datenschutzhinweis";
import { Bounce, toast } from "react-toastify";
import { SubmitHandler, useForm } from "react-hook-form";
import type { Question } from "@/types/Question";
import ErrorIndicator from "@/components/ErrorIndicator";
import { useAuthState } from "react-firebase-hooks/auth";
import QuestionSkeletonLoader from "@/components/QuestionSkeletonLoader";
import { DescriptionTexts } from "@/types/DescriptionTexts";
import { Datenschutz } from "./lib/types/Datenschutz";

type FormData = {
  name: string;
  age: number;
  location: string;
  picture: (Blob | Uint8Array | ArrayBuffer)[];
  [key: `question-${number}`]: string[];
  datenschutzErklaerung: (Blob | Uint8Array | ArrayBuffer)[];
  terms: boolean;
  terms2: boolean;
  securityQuestion: string;
};

export default function Home() {
  // form-hooks
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  // firebase-hooks
  const [settingsValue, settingsLoading, settingsError] = useDocument(
    doc(db, "settings", "settings"),
  );
  const [uploadFile, uploading, snapshot, uploadError] = useUploadFile();
  const [user, userLoading, userError] = useAuthState(auth);

  // states
  const [directCam, setDirectCam] = useState(false);
  const [clickCounter, setClickCounter] = useState<number>(0);
  const [whatsUploading, setWhatsUploading] = useState<string>("");
  const [onFestival, setOnFestival] = useState<boolean>(true);

  /**
   * Handles the form submission
   * @param data
   */
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (data.securityQuestion !== "") {
      return;
    }

    const name = data.name;
    const age = data.age;
    const location = data.location;
    const picture = data.picture[0];
    const datenschutzErklaerung = data.datenschutzErklaerung[0] ?? null;
    // if (
    //   datenschutzErklaerung &&
    //   !datenschutzErklaerung.toString().endsWith(".pdf")
    // ) {
    //   toast.error(
    //     "Bitte lade die Einverständniserklärung nur als PDF-Datei hoch!",
    //     {
    //       position: "top-center",
    //       autoClose: 8000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //       theme: "dark",
    //       transition: Bounce,
    //     },
    //   );
    //   return;
    // }

    const now = new Date().getTime().toString();

    const pictureName = `${name}_${now}.jpg`;
    const datenschutzErklaerungName = `${name}_${now}_datenschutz.pdf`;

    const answers = [];
    (settingsValue.data()!.questions as Question[]).forEach(
      (question: Question, i: number) => {
        answers.push({
          question: question.question,
          answer: data[`question-${i + 1}`],
        });
      },
    );

    const interviewRef = doc(db, "kurzinterviews", now);
    await setDoc(interviewRef, {
      id: now,
      name,
      age,
      location,
      answers,
      picture: pictureName,
      datenschutzErklaerung: datenschutzErklaerung
        ? datenschutzErklaerungName
        : false,
    });

    setWhatsUploading("Bild");
    await uploadFile(storageRef(storage, `portraits/${pictureName}`), picture, {
      contentType: "image/jpeg",
    });

    if (datenschutzErklaerung !== null) {
      setWhatsUploading("Datenschutzerklärung");
      await uploadFile(
        storageRef(
          storage,
          `datenschutzzustimmungen/${datenschutzErklaerungName}`,
        ),
        datenschutzErklaerung,
        {
          contentType: "application/pdf",
        },
      );
    }

    reset();
    toast.success("Vielen Dank für deine Teilnahme!", {
      position: "top-center",
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  };

  function acceptTerms(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setValue("terms", true);
    setValue("terms2", true);
  }

  return (
    <main>
      <div className="flex justify-between">
        <Image
          src={asj100}
          alt="Logo für 100 Jahre ASJ"
          width={200}
          onClick={() => setClickCounter((prev) => prev + 1)}
        />
        {(clickCounter >= 5 || user) && <Link href="/admin">Adminboard</Link>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          {!settingsLoading && (
            <p>
              {
                (settingsValue?.data()!.descriptionTexts as DescriptionTexts)
                  ?.welcomeText
              }
            </p>
          )}

          <div className="grid">
            <div>
              <h3>Über dich</h3>

              <p>
                {
                  (settingsValue?.data()!.descriptionTexts as DescriptionTexts)
                    ?.aboutYouDescription
                }
              </p>

              <div>
                <label>
                  Wie heißt du?
                  <input
                    type="text"
                    placeholder="Name"
                    {...(Object.hasOwn(errors, "name")
                      ? { "aria-invalid": Object.hasOwn(errors, "name") }
                      : {})}
                    aria-describedby="valid-helper-name"
                    {...register("name", {
                      required: {
                        value: true,
                        message:
                          "Bitte teil uns mit wie du heißt damit wir dich zuordnen können.",
                      },
                      minLength: {
                        value: 2,
                        message:
                          "Dein Name muss mindestens 2 Zeichen lang sein.",
                      },
                    })}
                  />
                  {errors.name && (
                    <small id="valid-helper-name">{errors.name?.message}</small>
                  )}
                </label>
                <label>
                  Wie alt bist du?
                  <input
                    type="number"
                    placeholder="Alter"
                    {...(Object.hasOwn(errors, "age")
                      ? { "aria-invalid": Object.hasOwn(errors, "age") }
                      : {})}
                    aria-describedby="valid-helper-age"
                    {...register("age", {
                      required: {
                        value: true,
                        message:
                          "Bitte gib dein Alter an. (siehe Datenschutzhinweis)",
                      },
                      min: {
                        value: 3,
                        message: "Du musst mindestens 3 Jahre alt sein.",
                      },
                      max: {
                        value: 120,
                        message: "Du bist höchstwahrscheinlich nicht so alt.",
                      },
                    })}
                  />
                  {errors.age && (
                    <small id="valid-helper-age">{errors.age?.message}</small>
                  )}
                </label>
                <label>
                  Wo kommst du her?
                  <input
                    type="string"
                    placeholder="Ort"
                    {...(Object.hasOwn(errors, "location")
                      ? { "aria-invalid": Object.hasOwn(errors, "location") }
                      : {})}
                    aria-describedby="valid-helper-location"
                    {...register("location", {
                      required: {
                        value: true,
                        message: "Bitte gib deinen Wohnort an.",
                      },
                      minLength: {
                        value: 2,
                        message:
                          "Dein Wohnort muss mindestens 2 Zeichen lang sein.",
                      },
                    })}
                  />
                  {errors.location && (
                    <small id="valid-helper-age">
                      {errors.location?.message}
                    </small>
                  )}
                </label>
                <label>
                  Ein Bild von dir
                  <input
                    type="file"
                    accept="image/png, image/gif, image/jpeg"
                    {...(directCam ? { capture: "environment" } : {})}
                    aria-describedby="valid-helper-picture"
                    {...(Object.hasOwn(errors, "picture")
                      ? { "aria-invalid": Object.hasOwn(errors, "picture") }
                      : {})}
                    {...register("picture", {
                      required: {
                        value: true,
                        message:
                          "Bitte lade ein Bild von dir hoch um deinem Interview ein Gesicht zu geben.",
                      },
                    })}
                  />
                  {errors.picture ? (
                    <small id="valid-helper-picture">
                      {errors.picture?.message}
                    </small>
                  ) : (
                    <small id="picture-helper">
                      Zeig uns dein schönstes Lächeln!
                    </small>
                  )}
                </label>
              </div>
            </div>

            <div>
              <h3>Fragen</h3>

              <p>
                {
                  (settingsValue?.data()!.descriptionTexts as DescriptionTexts)
                    ?.questionsDescription
                }
              </p>

              <div>
                {settingsError && (
                  <ErrorIndicator>Konnte Fragen nicht laden</ErrorIndicator>
                )}
                {settingsLoading && <QuestionSkeletonLoader />}

                {settingsValue?.data()!.questions.length === 0 && (
                  <p>
                    Keine Fragen?? Komm zu einem späteren Zeitpunkt bitte
                    wieder...
                  </p>
                )}

                {settingsValue?.data()!.questions.length > 0 &&
                  (settingsValue?.data()!.questions as Question[]).map(
                    (question, i: number) => {
                      return (
                        <label key={`question-key-${i}`}>
                          {!settingsLoading &&
                            settingsValue &&
                            question.question}
                          <textarea
                            className="resize-none"
                            placeholder={question.example}
                            {...(Object.hasOwn(errors, `question-${i + 1}`)
                              ? {
                                  "aria-invalid": Object.hasOwn(
                                    errors,
                                    `question-${i + 1}`,
                                  ),
                                }
                              : {})}
                            aria-describedby={`valid-helper-question-${i + 1}`}
                            {...register(`question-${i + 1}`, {
                              required: {
                                value: true,
                                message: "Bitte beantworte diese Frage.",
                              },
                              minLength: {
                                value: 5,
                                message:
                                  "Deine Antwort sollte mindestens 5 Zeichen lang sein.",
                              },
                            })}
                          />
                          {errors[`question-${i + 1}`] && (
                            <small id={`valid-helper-question-${i + 1}`}>
                              {errors[`question-${i + 1}`]?.message}
                            </small>
                          )}
                        </label>
                      );
                    },
                  )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3>Datenschutz</h3>

            <label className={onFestival ? "mb-6" : ""}>
              Bist du gerade auf dem Festival?{" "}
              <input
                type="checkbox"
                checked={onFestival}
                onChange={() => setOnFestival(!onFestival)}
              />{" "}
              {onFestival ? "Ja" : "Nein"}
            </label>

            <div className="grid">
              {!onFestival && (
                <article>
                  <label>
                    Solltest du noch keine Einverständniserklärung ausgefüllt
                    haben nutze bitte{" "}
                    <a
                      href="https://tms.aloom.de/files/659d6da2f07f91.52148902/EE_Foto-Film_U18_Festival.pdf"
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      diesen Link
                    </a>{" "}
                    und lade uns das ausgefüllte Formular hier hoch!
                    <input
                      type="file"
                      accept="application/pdf"
                      aria-describedby="valid-helper-datenschutzErklaerung"
                      {...(Object.hasOwn(errors, "datenschutzErklaerung")
                        ? {
                            "aria-invalid": Object.hasOwn(
                              errors,
                              "datenschutzErklaerung",
                            ),
                          }
                        : {})}
                      {...register("datenschutzErklaerung", {
                        required: false,
                      })}
                    />
                    {errors.datenschutzErklaerung && (
                      <small id="valid-helper-datenschutzErklaerung">
                        {errors.datenschutzErklaerung?.message}
                      </small>
                    )}
                  </label>
                </article>
              )}

              <div>
                <div className="mb-2">
                  Ich habe den{" "}
                  <DatenschutzhinweisComponent
                    open={false}
                    onAccept={(e) => acceptTerms(e)}
                  />{" "}
                  gelesen...
                </div>
                <label>
                  <input
                    type="checkbox"
                    role="switch"
                    aria-describedby="valid-helper-terms"
                    {...(Object.hasOwn(errors, "terms")
                      ? { "aria-invalid": Object.hasOwn(errors, "terms") }
                      : {})}
                    {...register("terms", {
                      required: {
                        value: true,
                        message:
                          "Bitte lies und akzeptiere den Datenschutzhinweis bevor du dein Interview abschicken kannst.",
                      },
                    })}
                  />
                  ... und bin mit dem Speichern meiner Daten einverstanden.
                </label>
                {errors.terms && (
                  <small id="valid-helper-terms" className="text-red-500">
                    {errors.terms?.message}
                  </small>
                )}
                <label>
                  <input
                    type="checkbox"
                    role="switch"
                    aria-describedby="valid-helper-terms2"
                    {...(Object.hasOwn(errors, "terms2")
                      ? { "aria-invalid": Object.hasOwn(errors, "terms2") }
                      : {})}
                    {...register("terms2", {
                      required: {
                        value: true,
                        message:
                          "Bitte bestätige, dass du mit der Verarbeitung deiner Daten einverstanden bist.",
                      },
                    })}
                  />
                  ... und ich bin der Verarbeitung und Veröffentlichung meiner
                  Daten einverstanden.
                </label>
                {errors.terms2 && (
                  <small id="valid-helper-terms2" className="text-red-500">
                    {errors.terms2?.message}
                  </small>
                )}
                <label className="sr-only">
                  <input
                    type="text"
                    {...register("securityQuestion", {
                      required: {
                        value: false,
                        message: "Bitte beantworte diese Frage",
                      },
                    })}
                  />
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        <input
          type="submit"
          value={
            isSubmitting
              ? `Lade ${whatsUploading + " "}hoch... ${snapshot?.bytesTransferred > 0 ? ((snapshot?.bytesTransferred / snapshot?.totalBytes) * 100).toFixed(0) + "%" : ""}`
              : "Abschicken"
          }
          disabled={isSubmitting || !settingsValue}
        />
        {/* {uploading && snapshot.bytesTransferred > 0 && (
          <progress
            value={(
              (snapshot.bytesTransferred / snapshot.totalBytes) *
              100
            ).toFixed(0)}
            max="100"
          />
        )}
        {uploading && snapshot.bytesTransferred === 0 && <progress />} */}
      </form>
    </main>
  );
}
