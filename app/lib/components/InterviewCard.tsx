"use client";

import { useDownloadURL } from "react-firebase-hooks/storage";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../firebase-config";
import { deleteDoc, doc } from "firebase/firestore";
import { useDocumentOnce } from "react-firebase-hooks/firestore";

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
  const storageRef = ref(storage, `portraits/${imgPath}`);

  const [value, answersLoading, answersError] = useDocumentOnce(
    doc(db, "settings", "settings"),
  );

  const [url, loading, error] = useDownloadURL(storageRef);

  function getQuestionAnswer() {
    let answer = "";

    value
      ?.data()!
      .questions.forEach(
        (question: { question: string; example: string }, i: number) => {
          answer += question.question + "\n";
          answer += answers[i] + "\n\n";
        },
      );

    return answer;
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
          {!loading && url && <img src={url} alt={`Bild von ${name}`} />}
        </header>

        <p>Name: {name}</p>
        <p className={age < 18 ? "bg-red-500" : ""}>Alter: {age}</p>
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
