"use client";

import Image from "next/image";
import asj100 from "/public/100JahreASJLogo_RGB_4zu3.png";
import { useState } from "react";
import Link from "next/link";
import { ref as storageRef } from "firebase/storage";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "@/app/lib/firebase-config";
import { useUploadFile } from "react-firebase-hooks/storage";
import DatenschutzhinweisComponent from "@/app/lib/components/Datenschutzhinweis";
import LoadingSpinner from "@/app/lib/components/LoadingSpinner";
import { Bounce, toast } from "react-toastify";
import { useForm } from "react-hook-form";
import type { Question } from "@/app/lib/types/Question";
import ErrorIndicator from "@/app/lib/components/ErrorIndicator";
import { useAuthState } from "react-firebase-hooks/auth";

interface IFormData {
  name: string;
  age: number;
  picture: (Blob | Uint8Array | ArrayBuffer)[];
  terms: boolean;

  [key: `question${number}`]: string[];
}

export default function Home() {
  // form-hooks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormData>();

  // firebase-hooks
  const [settingsValue, settingsLoading, settingsError] = useDocument(
    doc(db, "settings", "settings")
  );
  const [uploadFile, uploading, snapshot, uploadError] = useUploadFile();
  const [user, userLoading, userError] = useAuthState(auth);

  // states
  const [directCam, setDirectCam] = useState(false);
  const [clickCounter, setClickCounter] = useState<number>(0);

  async function onSubmit(data: IFormData) {
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
      }
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
      position: "top-right",
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
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
          <div className="flex flex-col lg:flex-row gap-2">
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
                    <small id="valid-helper-name">
                      {errors.name?.message! as string}
                    </small>
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
                    <small id="valid-helper-age">
                      {errors.age?.message! as string}
                    </small>
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
                      {errors.picture?.message! as string}
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
                {settingsLoading && (
                  <LoadingSpinner>Lade Fragen</LoadingSpinner>
                )}
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
                        i: number
                      ) => {
                        return (
                          <label key={i}>
                            {!settingsLoading &&
                              settingsValue &&
                              question.question}
                            <input
                              type="text"
                              placeholder={question.example}
                              {...(Object.hasOwn(errors, `question${i + 1}`)
                                ? {
                                    "aria-invalid": Object.hasOwn(
                                      errors,
                                      `question${i + 1}`
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
                                {errors[`question${i + 1}`]?.message! as string}
                              </small>
                            )}
                          </label>
                        );
                      }
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
            <small id="valid-helper-terms" className="text-red-300">
              {errors.terms?.message! as string}
            </small>
          )}
        </fieldset>

        <input
          type="submit"
          value={uploading ? "Lade hoch..." : "Abschicken"}
          disabled={uploading || !settingsValue}
        />
      </form>
    </main>
  );
}
