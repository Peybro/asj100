"use client";

import { useDownloadURL } from "react-firebase-hooks/storage";
import { getStorage, ref as storageRef } from "firebase/storage";
import { db, storage } from "../firebase-config";
import { deleteDoc, doc } from "firebase/firestore";

export default function InterviewCard({
  id,
  imgPath,
  name,
  age,
  answers,
  editMode,
  showAsList,
}: {
  id: string;
  imgPath: string;
  name: string;
  age: number;
  answers: string[];
  editMode: boolean;
  showAsList: boolean;
}) {
  const [url, loading, error] = useDownloadURL(
    storageRef(storage, `portraits/${imgPath}`),
  );

  function download() {
    alert("Download");
  }

  async function remove() {
    await deleteDoc(doc(db, "kurzinterviews", id));
  }

  function CardContent() {
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
          {editMode && (
            <button className="bg-red-500 border-red-500" onClick={remove}>
              Löschen
            </button>
          )}
        </footer>
      </article>
    );
  }

  if (showAsList) {
    return (
      <details>
        <summary>{name}</summary>
        <CardContent />
      </details>
    );
  } else {
    return <CardContent />;
  }
}
