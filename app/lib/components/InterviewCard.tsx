import { useDownloadURL } from "react-firebase-hooks/storage";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/firebase-config";
import { deleteDoc, doc } from "firebase/firestore";
import type { Answer } from "@/types/Answer";
import ErrorIndicator from "./ErrorIndicator";
import { Interview } from "@/types/Interview";
import LoadingSpinner from "./LoadingSpinner";

type InterviewCardProps = {
  interview: Interview;
  editMode: boolean;
  onRemove: () => void;
  showAsList: boolean;
};

/**
 * Displays a card with the information of an interview
 */
export default function InterviewCard({
  interview,
  editMode,
  onRemove,
  showAsList,
}: InterviewCardProps) {
  const { id, name, age, picture, answers } = interview;

  const storageRef = ref(storage, `portraits/${picture}`);
  const [url, urlLoading, urlError] = useDownloadURL(storageRef);

  /**
   * Builds the answer string for a person in a readable format
   * @returns String with all answers
   */
  function buildAnswerString() {
    let returnAnswer = "";

    answers.forEach((answer: Answer) => {
      returnAnswer += answer.question + "\n";
      returnAnswer += answer.answer + "\n\n";
    });

    return returnAnswer;
  }

  /**
   * Downloads the interview as a text file
   */
  async function download() {
    const link = document.createElement("a");
    const content = `Name: ${name}, Alter: ${age}
Bild: ${picture}

${buildAnswerString()}`;

    const file = new Blob([content], { type: "text/plain" });
    link.href = URL.createObjectURL(file);
    link.download = `${name}_${id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Removes the interview from the database and its picture storage
   */
  async function remove() {
    try {
      await deleteDoc(doc(db, "kurzinterviews", id));
      await deleteObject(storageRef);
      onRemove();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Card content
   * @returns Card content
   */
  function CardContent(): JSX.Element {
    return (
      <article>
        <header>
          {urlError && (
            <ErrorIndicator error={urlError}>
              <p>Fehler beim Laden des Bildes</p>
            </ErrorIndicator>
          )}
          {urlLoading && <LoadingSpinner>Lade Bild...</LoadingSpinner>}
          {!urlLoading && url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={`Bild von ${name}`} className="w-full" />
          )}
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

        <footer className="grid sm:grid-cols-2 md:grid-cols-1">
          <button onClick={download}>Download</button>
          {editMode && (
            <button className="border-red-500 bg-red-500" onClick={remove}>
              Löschen
            </button>
          )}
        </footer>
      </article>
    );
  }

  if (showAsList) {
    return (
      <>
        <details>
          <summary>
            {name} {age < 18 && <span>({"< 18"})</span>}
          </summary>
          <CardContent />
        </details>
      </>
    );
  } else {
    return <CardContent />;
  }
}
