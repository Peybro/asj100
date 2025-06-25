import { db } from "@/firebase-config";
import { deleteDoc, doc } from "firebase/firestore";
import type { Answer } from "@/types/Answer";
import { Interview } from "@/types/Interview";

type InterviewCardProps = {
  interview: Interview;
  editMode: boolean;
  onRemove: () => void;
  index: number;
};

/**
 * Displays a card with the information of an interview
 */
export default function InterviewCard({
  interview,
  editMode,
  onRemove,
  index,
}: InterviewCardProps) {
  const { id, name, answers } = interview;

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
    const content = `Name: ${name ? name : "Anonym"}

${buildAnswerString()}`;

    const file = new Blob([content], { type: "text/plain" });
    link.href = URL.createObjectURL(file);
    link.download = `${id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Removes the interview from the database and its picture storage
   */
  async function remove() {
    try {
      await deleteDoc(doc(db, "kurzinterviews", id));
      // await deleteObject(pictureStorageRef);
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
        <details>
          <summary>{index + 1}. Antwortbogen</summary>

          {answers.map((answer: Answer, i: number) => {
            return (
              <div key={`answer-key-${i}`} className="mb-3">
                <span className="font-bold">{answer.question}</span>
                <br />
                <span>
                  {"> "}
                  <span className="italic">
                    {answer.answer === "" ? "-" : answer.answer}
                  </span>
                </span>
                <hr />
              </div>
            );
          })}
        </details>
        <footer className="grid grid-cols-1">
          <button onClick={download} className="outline">Download</button>
          {editMode && (
            <button className="border-red-500 bg-red-500" onClick={remove}>
              Löschen
            </button>
          )}
        </footer>
      </article>
    );
  }

  return <CardContent />;
}
