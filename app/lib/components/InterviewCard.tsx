"use client";

import Image from "next/image";
import { useDownloadURL } from "react-firebase-hooks/storage";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/app/lib/firebase-config";
import { deleteDoc, doc } from "firebase/firestore";
import type { Answer } from "@/app/lib/types/Answer";

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
  answers: Answer[];
  editMode: boolean;
  showAsList: boolean;
}) {
  const storageRef = ref(storage, `portraits/${imgPath}`);

  const [url, loading, error] = useDownloadURL(storageRef);

  function getQuestionAnswer() {
    let returnAnswer = "";

    answers.forEach((answer: Answer) => {
      returnAnswer += answer.question + "\n";
      returnAnswer += answer.answer + "\n\n";
    });

    return returnAnswer;
  }

  async function download() {
    const link = document.createElement("a");
    const content = `Name: ${name}, Alter: ${age}
Bild: ${imgPath}

${getQuestionAnswer()}`;

    const file = new Blob([content], { type: "text/plain" });
    link.href = URL.createObjectURL(file);
    link.download = `${name}_${id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function remove() {
    try {
      await deleteDoc(doc(db, "kurzinterviews", id));
      await deleteObject(storageRef);
    } catch (error) {
      console.error(error);
    }
  }

  function CardContent() {
    return (
      <article>
        <header>
          {error && <p>Fehler beim Laden des Bildes: {error.message}</p>}
          {loading && <p>Lade bild...</p>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {!loading && url && <img src={url} alt={`Bild von ${name}`} />}
        </header>

        <p>
          <span className="font-bold">Name:</span> {name}
        </p>
        <p className={age < 18 ? "bg-red-500" : ""}>
          <span className="font-bold">Alter:</span> {age}
        </p>
        {answers.map((answer: Answer, i: number) => {
          return (
            <div key={i} className="mb-3">
              <span className="font-bold">{answer.question}</span>
              <br />
              <span>{answer.answer}</span>
            </div>
          );
        })}

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
        <summary>
          {name} {age < 18 && <span>({"< 18"})</span>}
        </summary>
        <CardContent />
      </details>
    );
  } else {
    return <CardContent />;
  }
}
