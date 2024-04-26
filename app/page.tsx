"use client";

import Image from "next/image";
import asj100 from "/public/100JahreASJLogo_RGB_4zu3.png";
import { useState } from "react";
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

type FormData = {
  name: string;
  age: number;
  picture: (Blob | Uint8Array | ArrayBuffer)[];
  [key: `question${number}`]: string[];
  terms: boolean;
  securityQuestion: string;
};

export default function Home() {
  // form-hooks
  const {
    register,
    handleSubmit,
    reset,
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
    const picture = data.picture[0];

    const now = new Date().getTime().toString();

    const pictureName = `${name}_${now}.jpg`;

    const answers = [];
    (settingsValue.data()!.questions as Question[]).forEach(
      (question: Question, i: number) => {
        answers.push({
          question: question.question,
          answer: data[`question${i + 1}`],
        });
      },
    );

    const interviewRef = doc(db, "kurzinterviews", now);
    await setDoc(interviewRef, {
      id: now,
      name,
      age,
      answers,
      picture: pictureName,
    });

    await uploadFile(storageRef(storage, `portraits/${pictureName}`), picture, {
      contentType: "image/jpeg",
    });

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
          <div className="autogrid">
            <div>
              <h3>Über dich</h3>
              <article>
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
                    })}
                  />
                  {errors.age && (
                    <small id="valid-helper-age">{errors.age?.message}</small>
                  )}
                </label>
                <label>
                  Bild
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
              </article>
            </div>

            <div>
              <h3>Fragen</h3>
              <article>
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
                  settingsValue
                    ?.data()!
                    .questions.map(
                      (
                        question: { question: string; example: string },
                        i: number,
                      ) => {
                        return (
                          <label key={`question-key-${i}`}>
                            {!settingsLoading &&
                              settingsValue &&
                              question.question}
                            <textarea
                              className="resize-none"
                              placeholder={question.example}
                              {...(Object.hasOwn(errors, `question${i + 1}`)
                                ? {
                                    "aria-invalid": Object.hasOwn(
                                      errors,
                                      `question${i + 1}`,
                                    ),
                                  }
                                : {})}
                              aria-describedby={`valid-helper-question${i + 1}`}
                              {...register(`question${i + 1}`, {
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
                            {errors[`question${i + 1}`] && (
                              <small id={`valid-helper-question${i + 1}`}>
                                {errors[`question${i + 1}`]?.message}
                              </small>
                            )}
                          </label>
                        );
                      },
                    )}
              </article>
            </div>
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
            Ich habe den <DatenschutzhinweisComponent open={false} /> gelesen
            und bin mit dem Speichern meiner Daten einverstanden.
          </label>
          {errors.terms && (
            <small id="valid-helper-terms" className="text-red-400">
              {errors.terms?.message}
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
        </fieldset>

        <input
          type="submit"
          value={
            isSubmitting
              ? `Lade hoch... ${snapshot?.bytesTransferred > 0 ? ((snapshot?.bytesTransferred / snapshot?.totalBytes) * 100).toFixed(0) + "%" : ""}`
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
