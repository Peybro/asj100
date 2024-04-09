"use client";

import { db } from "@/app/lib/firebase-config";
import { collection } from "firebase/firestore";
import Link from "next/link";
import { useCollection } from "react-firebase-hooks/firestore";

export default function Einsendungen() {
  const [value, loading, error] = useCollection(
    collection(db, "kurzinterviews")
  );

  return (
    <>
      <h1>Einsendungen</h1>
      <Link href="/">zum Formular</Link>

      <div>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Collection: Loading...</span>}

        {value &&
          value.docs.map((interview) => {
            return (
              <article>
                <header>[{interview.data().picture}]</header>

                <p>Name: {interview.data().id}</p>
                <p>Frage 1: {interview.data().questions[0]}</p>
                <p>Frage 2: {interview.data().questions[1]}</p>
                <p>Frage 3: {interview.data().questions[2]}</p>

                <footer>
                  <button>Download</button> <button>Löschen</button>
                </footer>
              </article>
            );
          })}
      </div>
    </>
  );
}
