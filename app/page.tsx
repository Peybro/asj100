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

export default function Home() {
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
        .questions.map((_: { question: string; example: string }) => ""),
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
        },
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
      },
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

      <form onSubmit={handleUpload} id="interview-form">
        <fieldset>
          <h3>Das bin ich</h3>
          <article>
            <label>
              Wie heißt du?
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
              />
            </label>
            <label>
              Wie alt bist du?
              <input
                type="number"
                name="age"
                placeholder="Alter"
                value={age}
                onChange={(e) => setAge(e.currentTarget.value.toString())}
                required
              />
            </label>
            <label>
              Bild
              <input
                type="file"
                name="picture"
                accept="image/png, image/gif, image/jpeg"
                aria-describedby="picture-helper"
                {...(directCam ? { capture: "environment" } : {})}
                onChange={(e) => {
                  const file = e.target.files ? e.target.files[0] : undefined;
                  setSelectedFile(file);
                }}
                required
              />
              <small id="picture-helper">
                Zeig uns dein schönstes Lächeln!
              </small>
            </label>
          </article>

          <h3>Fragen</h3>
          <article>
            {error && `Konnte Fragen nicht laden`}
            {loading && <LoadingSpinner>Lade Fragen</LoadingSpinner>}
            {value
              ?.data()!
              .questions.map(
                (
                  question: { question: string; example: string },
                  i: number,
                ) => {
                  return (
                    <label key={i}>
                      {!loading && value && question.question}
                      <input
                        type="text"
                        name={`question${i + 1}`}
                        placeholder={question.example}
                        aria-describedby={`question${i + 1}-helper`}
                        value={answers[i]}
                        onChange={(e) => {
                          const answer = e.currentTarget.value;
                          setAnswers((prev) => prev.toSpliced(i, 1, answer));
                        }}
                        required
                      />
                      <small id={`question${i + 1}-helper`}></small>
                    </label>
                  );
                },
              )}
          </article>

          <label>
            <input
              name="terms"
              type="checkbox"
              role="switch"
              checked={accepted}
              onChange={() => setAccepted((prev) => !prev)}
              required
            />
            Ich habe den <DatenschutzhinweisComponent open={false} /> gelesen
            und bin mit dem Speichern meiner Daten einverstanden.
          </label>
        </fieldset>

        <input
          type="submit"
          value={uploading ? "Lade hoch..." : "Abschicken"}
        />
      </form>

      <button onClick={reset}>Reset</button>
    </main>
  );
}
