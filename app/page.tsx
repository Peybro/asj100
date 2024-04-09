"use client";

import Image from "next/image";
import asj100 from "./../public/100JahreASJLogo_RGB_4zu3.png";
import { useState } from "react";
import Link from "next/link";
import { ref as storageRef } from "firebase/storage";
import { useDocument } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "./lib/firebase-config";
import { useUploadFile } from "react-firebase-hooks/storage";

export default function Home() {
  const [directCam, setDirectCam] = useState(false);

  const [value, loading, error] = useDocument(doc(db, "settings", "settings"));

  const [uploadFile, uploading, snapshot, uploadError] = useUploadFile();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [answers, setAnswers] = useState(["", "", ""]);
  const [accepted, setAccepted] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();

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
            <small id="picture-helper">Zeig uns dein schönstes Lächeln!</small>
          </label>

          <>
            <label>
              {error && "Konnte Frage 1 nicht laden"}
              {loading && "Lade Frage 1..."}
              {!loading && value && value?.data()!.questions[0].question}
              <input
                type="text"
                name="question1"
                placeholder={value?.data()!.questions[0].example}
                aria-describedby="question1-helper"
                onChange={(e) => {
                  const answer = e.currentTarget.value;
                  setAnswers((prev) => prev.toSpliced(0, 1, answer));
                }}
              />
              <small id="question1-helper"></small>
            </label>

            <label>
              {error && "Konnte Frage 2 nicht laden"}
              {loading && "Lade Frage 2..."}
              {!loading && value && value?.data()!.questions[1].question}
              <input
                type="text"
                name="question2"
                placeholder={value?.data()!.questions[1].example}
                aria-describedby="question2-helper"
                onChange={(e) => {
                  const answer = e.currentTarget.value;
                  setAnswers((prev) => prev.toSpliced(1, 1, answer));
                }}
              />
              <small id="question2-helper"></small>
            </label>

            <label>
              {error && "Konnte Frage 3 nicht laden"}
              {loading && "Lade Frage 3..."}
              {!loading && value && value?.data()!.questions[2].question}
              <input
                type="text"
                name="question3"
                placeholder={value?.data()!.questions[2].example}
                aria-describedby="question3-helper"
                onChange={(e) => {
                  const answer = e.currentTarget.value;
                  setAnswers((prev) => prev.toSpliced(2, 1, answer));
                }}
              />
              <small id="question3-helper"></small>
            </label>
          </>

          <label>
            <input
              name="terms"
              type="checkbox"
              role="switch"
              onChange={() => setAccepted((prev) => !prev)}
            />
            Ich habe den Datenschutzhinweis gelesen und bin mit dem Speichern
            meiner Daten einverstanden.
          </label>
        </fieldset>

        <input type="submit" value="Abschicken" />
      </form>
    </main>
  );
}
