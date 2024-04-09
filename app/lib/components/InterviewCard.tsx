"use client";

import { useDownloadURL } from "react-firebase-hooks/storage";
import { getStorage, ref as storageRef } from "firebase/storage";
import { storage } from "../firebase-config";

export default function InterviewCard({
  imgPath,
  name,
  age,
  answers,
}: {
  imgPath: string;
  name: string;
  age: number;
  answers: string[];
}) {
  const [url, loading, error] = useDownloadURL(
    storageRef(storage, `portraits/${imgPath}`)
  );

  function download() {
    alert("Download");
  }

  function remove() {
    alert("Löschen");
  }

  return (
    <article>
      <header>
        {error && <p>Fehler beim Laden des Bildes: {error.message}</p>}
        {loading && <p>Lade bild...</p>}
        {!loading && url && <img src={url} alt={`Bild von ${name}`} />}
      </header>

      <p>Name: {name}</p>
      <p>Alter: {age}</p>
      <p>Frage 1: {answers[0]}</p>
      <p>Frage 2: {answers[1]}</p>
      <p>Frage 3: {answers[2]}</p>

      <footer>
        <button onClick={download}>Download</button>{" "}
        <button onClick={remove}>Löschen</button>
      </footer>
    </article>
  );
}
