"use client";

import Image from "next/image";
import asgLogo from "/public/asg-logo.jpg";
import { MouseEvent, useState } from "react";
import Link from "next/link";
import { ref as storageRef } from "firebase/storage";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc, setDoc, updateDoc } from "firebase/firestore";
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
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import { MessageCircleQuestionMark, ShieldAlert } from "lucide-react";

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

  /**
   * Handles the form submission
   * @param data
   */
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (data.securityQuestion !== "") {
      return;
    }

    const name = uuidv4().slice(0, 8);
    const picture = data.picture[0];

    const now = new Date().getTime().toString();

    const pictureUUID = uuidv4();
    const pictureName = `${pictureUUID}.jpg`;

    const answers = [];
    (settingsValue.data()!.questions as Question[]).forEach(
      (question: Question, i: number) => {
        answers.push({
          question: question.question,
          answer: data[`question-${i + 1}`],
        });
      },
    );

    if (
      !answers.every((answer) => answer.answer === "" || answer.answer === null)
    ) {
      const interviewRef = doc(db, "kurzinterviews", now);
      await setDoc(interviewRef, {
        id: now,
        name,
        answers,
      });
    }

    if (picture) {
      const pictureLinkRef = doc(db, "portraitLinks", pictureUUID);
      await setDoc(pictureLinkRef, { pictureName });

      setWhatsUploading("Bild");
      await uploadFile(
        storageRef(storage, `portraits/${pictureName}`),
        picture,
        {
          contentType: "image/jpeg",
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
      <h1 className="text-2xl">Klassentreffen Abi 2015</h1>
      <div className="flex justify-between">
        <Image
          src={asgLogo}
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
              <h3 className="flex items-center gap-2">
                Fragen
                <MessageCircleQuestionMark />
              </h3>

              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} className="text-blue-500" />
                  ),
                }}
              >
                {
                  (settingsValue?.data()!.descriptionTexts as DescriptionTexts)
                    ?.questionsDescription
                }
              </ReactMarkdown>

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
                          {question.type === "yesno" && (
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                value="Ja"
                                id={`question-${i + 1}-yes`}
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
                                    value: false,
                                    message: "Bitte beantworte diese Frage.",
                                  },
                                  minLength: {
                                    value: 1,
                                    message:
                                      "Deine Antwort sollte mindestens 1 Zeichen lang sein.",
                                  },
                                })}
                              />
                              <label htmlFor={`question-${i + 1}-yes`}>
                                Ja
                              </label>
                              <input
                                type="radio"
                                value="Nein"
                                id={`question-${i + 1}-no`}
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
                                    value: false,
                                    message: "Bitte beantworte diese Frage.",
                                  },
                                  minLength: {
                                    value: 1,
                                    message:
                                      "Deine Antwort sollte mindestens 1 Zeichen lang sein.",
                                  },
                                })}
                              />
                              <label htmlFor={`question-${i + 1}-no`}>
                                Nein
                              </label>
                            </div>
                          )}

                          {(question.type === "text" ||
                            question.type === undefined) && (
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
                                  value: false,
                                  message: "Bitte beantworte diese Frage.",
                                },
                                minLength: {
                                  value: 1,
                                  message:
                                    "Deine Antwort sollte mindestens 1 Zeichen lang sein.",
                                },
                              })}
                            />
                          )}
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

          <hr />

          <label id="picture-upload">
            <span>Hast Du Lust ein aktuelles Foto mit uns zu teilen?</span>
            <br />
            <small className="text-red-500">
              Das Foto wird unabhängig von deinen Antworten gespeichert, sodass
              diese anonym bleiben!
            </small>
            <br />
            <small>
              Wenn wir genug Bilder zusammen bekommen, werden wir versuchen eine
              kleine Collage von allen Bildern zu erstellen
            </small>
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
                  value: false,
                  message:
                    "Bitte lade ein Bild von dir hoch um deinem Interview ein Gesicht zu geben.",
                },
              })}
            />
            {errors.picture ? (
              <small id="valid-helper-picture">{errors.picture?.message}</small>
            ) : (
              <small id="picture-helper">
                Zeig uns dein schönstes Lächeln!
              </small>
            )}
          </label>

          <hr />

          <div className="mt-4">
            <h3 className="flex items-center gap-2">
              Datenschutz <ShieldAlert />
            </h3>

            <div className="grid">
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
                  ... und ich bin der Verarbeitung und Auswertung meiner Daten
                  einverstanden.
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
              ? `Lade ${whatsUploading} hoch... ${snapshot?.bytesTransferred > 0 ? ((snapshot?.bytesTransferred / snapshot?.totalBytes) * 100).toFixed(0) + "%" : ""}`
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
