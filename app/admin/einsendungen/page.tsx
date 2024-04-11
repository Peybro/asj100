import InterviewCard from "@/app/lib/components/InterviewCard";
import { db } from "@/app/lib/firebase-config";
import { collection, doc } from "firebase/firestore";
import { useState } from "react";
import { useCollection, useDocumentOnce } from "react-firebase-hooks/firestore";

export default function Einsendungen() {
  const [value, loading, error] = useCollection(
    collection(db, "kurzinterviews"),
  );

  const [answersValue, answersLoading, answersError] = useDocumentOnce(
    doc(db, "settings", "settings"),
  );

  const [editMode, setEditMode] = useState(false);
  const [showAsList, setShowAsList] = useState(true);

  function getQuestionAnswer(interviewAnswers: string[]) {
    let answer = "";

    answersValue
      ?.data()!
      .questions.forEach(
        (question: { question: string; example: string }, i: number) => {
          answer += question.question + "\n";
          answer += interviewAnswers[i] + "\n\n";
        },
      );

    return answer;
  }

  function addPerson(interview: {
    id: string;
    name: string;
    age: number;
    picture: string;
    questions: string[];
  }) {
    return `Name: ${interview.name}, Alter: ${interview.age}
Bild: ${interview.picture}

${getQuestionAnswer(interview.questions)}
=============================================\n\n`;
  }

  async function downloadAll() {
    const link = document.createElement("a");

    let content = "";
    value?.docs.forEach((interview) => {
      content += addPerson(
        interview.data() as {
          id: string;
          name: string;
          age: number;
          picture: string;
          questions: string[];
        },
      );
    });

    const file = new Blob([content], { type: "text/plain" });
    link.href = URL.createObjectURL(file);
    const now = new Date();
    link.download = `alle-Teilnehmer_${now.toLocaleDateString()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <>
      <h1>Einsendungen</h1>

      <div className="grid mb-2">
        {/* <Link href="/" role="button">
          zum Formular
        </Link>{" "} */}
        <button onClick={downloadAll}>Alle downloaden</button>{" "}
        <button
          className="secondary"
          onClick={() => setEditMode((prev) => !prev)}
        >
          {editMode ? "Fertig" : "Bearbeiten"}
        </button>
      </div>

      <hr />

      <label>
        <input
          type="checkbox"
          role="switch"
          checked={showAsList}
          onChange={() => setShowAsList((prev) => !prev)}
        />
        Liste
      </label>

      <hr />

      <div>
        {error && <strong>Fehler: {error.message}</strong>}
        {loading && <span>Lade Einsendungen...</span>}

        {value && (
          <div className="grid">
            {value.docs.map((interview) => {
              return (
                <InterviewCard
                  key={interview.data().id}
                  id={interview.data().id}
                  imgPath={interview.data().picture}
                  name={interview.data().name}
                  age={interview.data().age}
                  answers={interview.data().questions}
                  editMode={editMode}
                  showAsList={showAsList}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
