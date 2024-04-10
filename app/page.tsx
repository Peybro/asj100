"use client";

import Image from "next/image";
import asj100 from "./../public/100JahreASJLogo_RGB_4zu3.png";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ref as storageRef } from "firebase/storage";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "./lib/firebase-config";
import { useUploadFile } from "react-firebase-hooks/storage";
import Datenschutzhinweis from "./datenschutzhinweis/page";
import DatenschutzhinweisComponent from "./lib/components/Datenschutzhinweis";
import LoadingSpinner from "./lib/components/LoadingSpinner";

export default function Home() {
  const [directCam, setDirectCam] = useState(false);

  const [value, loading, error] = useDocument(doc(db, "settings", "settings"));

  const [uploadFile, uploading, snapshot, uploadError] = useUploadFile();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [answers, setAnswers] = useState(["", "", ""]);
  const [accepted, setAccepted] = useState(false);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();

    // const data = new FormData(e.currentTarget);
    // const name = data.get("name");

    if (
      name === "" ||
      age === "" ||
      !selectedFile ||
      answers[0] === "" ||
      answers[1] === "" ||
      answers[2] === "" ||
      !accepted
    ) {
      alert("Bitte alles ausfüllen und akzeptieren!");
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

    // reset
  }

  return (
    <main>
      <div className="flex justify-between">
        <Image src={asj100} alt="Logo für 100 Jahre ASJ" height={130} />
        <Link href="/admin">Dashboard</Link>
      </div>

      <form onSubmit={handleUpload}>
        <fieldset>
          <article>
            <label>
              Wie heißt du?
              <input
                type="text"
                name="name"
                placeholder="Name"
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </label>
            <label>
              Wie alt bist du?
              <input
                type="text"
                name="age"
                placeholder="Alter"
                onChange={(e) => setAge(e.currentTarget.value)}
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
              />
              <small id="picture-helper">
                Zeig uns dein schönstes Lächeln!
              </small>
            </label>
          </article>
          <>
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
                        name={`question${i + 1}`}
                        placeholder={question.example}
                        aria-describedby={`question${i + 1}-helper`}
                        onChange={(e) => {
                          const answer = e.currentTarget.value;
                          setAnswers((prev) =>
                            prev.toSpliced(0, i + 1, answer)
                          );
                        }}
                      />
                      <small id={`question${i + 1}-helper`}></small>
                    </label>
                  );
                }
              )}
          </>
          <label>
            <input
              name="terms"
              type="checkbox"
              role="switch"
              onChange={() => setAccepted((prev) => !prev)}
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
    </main>
  );
}
