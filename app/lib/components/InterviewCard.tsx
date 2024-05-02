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
  const { id, name, age, location, picture, datenschutzErklaerung, answers } =
    interview;

  const pictureStorageRef = ref(storage, `portraits/${picture}`);
  const [pictureUrl, pictureLoading, pictureError] =
    useDownloadURL(pictureStorageRef);

  const datenschutzStorageRef = ref(
    storage,
    `datenschutzzustimmungen/${datenschutzErklaerung}`,
  );
  const [datenschutzUrl, datenschutzLoading, datenschutzError] = useDownloadURL(
    datenschutzStorageRef,
  );

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
    const content = `Name: ${name}, Alter: ${age}, Ort: ${location}
Bild: ${picture}
Einverständniserklärung: ${datenschutzErklaerung ? datenschutzErklaerung : "Nein"}

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
      await deleteObject(pictureStorageRef);
      if (datenschutzErklaerung) {
        await deleteObject(datenschutzStorageRef);
      }
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
          {pictureError && (
            <ErrorIndicator error={pictureError}>
              <p>Fehler beim Laden des Bildes</p>
            </ErrorIndicator>
          )}
          {pictureLoading && <LoadingSpinner>Lade Bild...</LoadingSpinner>}
          {!pictureLoading && pictureUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pictureUrl} alt={`Bild von ${name}`} className="w-full" />
          )}
        </header>

        <p>
          <span className="font-bold">{name}</span> (
          <span className={age < 18 ? "text-red-500" : ""}>{age}</span>) aus{" "}
          {location}
        </p>

        {answers.map((answer: Answer, i: number) => {
          return (
            <div key={`answer-key-${i}`} className="mb-3">
              <span className="font-bold">{answer.question}</span>
              <br />
              <span>{answer.answer}</span>
            </div>
          );
        })}

        <hr />

        <p>
          <span className="font-bold">
            Einverständniserklärung wurde extra hochgeladen?
          </span>
          <br />
          {datenschutzErklaerung && (
            <a
              className="text-blue-500 underline"
              href={datenschutzUrl}
              download
              target="_blank"
            >
              {datenschutzErklaerung}
            </a>
          )}
          {!datenschutzErklaerung && "Nein"}
        </p>

        <footer className="grid grid-cols-1">
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
            {name}{" "}
            {age < 18 && (
              <>
                (<span className="text-red-500">{"< 18"}</span>)
              </>
            )}
          </summary>
          <CardContent />
        </details>
      </>
    );
  } else {
    return <CardContent />;
  }
}
