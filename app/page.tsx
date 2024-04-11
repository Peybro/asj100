"use client";

import Image from "next/image";
import asj100 from "./../public/100JahreASJLogo_RGB_4zu3.png";
import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { ref as storageRef } from "firebase/storage";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "./lib/firebase-config";
import { useUploadFile } from "react-firebase-hooks/storage";
import Datenschutzhinweis from "./datenschutzhinweis/page";
import DatenschutzhinweisComponent from "./lib/components/Datenschutzhinweis";
import LoadingSpinner from "./lib/components/LoadingSpinner";
import { Bounce, toast } from "react-toastify";
import { useForm } from "react-hook-form";

export default function Home() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const onSubmit = (data: unknown) => console.log(data);

  const [directCam, setDirectCam] = useState(false);

  const [value, loading, error] = useDocument(doc(db, "settings", "settings"));

  const [uploadFile, uploading, snapshot, uploadError] = useUploadFile();

  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [answers, setAnswers] = useState<string[]>([]);
  const [accepted, setAccepted] = useState<boolean>(false);

  const [clickCounter, setClickCounter] = useState<number>(0);

  function reset() {
    (document.querySelector("#interview-form") as HTMLFormElement)!.reset();

    setName("");
    setAge("");
    setAnswers(
      value
        ?.data()!
        .questions.map((_: { question: string; example: string }) => "")
    );
    setAccepted(false);
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();

    // const data = new FormData(e.currentTarget);
    // const name = data.get("name");

    if (
      name === "" ||
      age === "" ||
      !selectedFile ||
      answers.some((answer) => answer === "") ||
      !accepted
    ) {
      toast.error(
        "Bitte alle Felder ausfüllen und bestätigen, dass du die Datenschutzbestimmungen akzeptierst.",
        {
          position: "top-right",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        }
      );
      return;
    }

    const now = new Date().getTime().toString();

    const pictureName = `${name}_${now}.jpg`;

    const interviewRef = doc(db, "kurzinterviews", now);
    setDoc(interviewRef, {
      id: now,
      name,
      age,
      questions: answers,
      picture: pictureName,
    });

    const result = await uploadFile(
      storageRef(storage, `portraits/${pictureName}`),
      selectedFile,
      {
        contentType: "image/jpeg",
      }
    );

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
          height={130}
          onClick={() => setClickCounter((prev) => prev + 1)}
        />
        {clickCounter >= 5 && <Link href="/admin">Dashboard</Link>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} id="interview-form">
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
                      required: { value: true, message: "Bitte Name angeben" },
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
                      required: { value: true, message: "Bitte Alter angeben" },
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
                      required: { value: true, message: "Bitte Bild angeben" },
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
                {error && `Konnte Fragen nicht laden`}
                {loading && <LoadingSpinner>Lade Fragen</LoadingSpinner>}
                {value
                  ?.data()!
                  .questions.map(
                    (
                      question: { question: string; example: string },
                      i: number
                    ) => {
                      return (
                        <label key={i}>
                          {!loading && value && question.question}
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
                                message: "Bitte Frage beantworten",
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
                required: { value: true, message: "Bitte akzeptieren" },
              })}
            />
            Ich habe den <DatenschutzhinweisComponent open={false} /> gelesen
            und bin mit dem Speichern meiner Daten einverstanden.
          </label>
          {errors.terms && (
            <small id="valid-helper-terms">
              {errors.terms?.message! as string}
            </small>
          )}
        </fieldset>

        <input
          type="submit"
          value={uploading ? "Lade hoch..." : "Abschicken"}
        />
      </form>
    </main>
  );
}
