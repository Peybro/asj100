"use client";

import InterviewCard from "@/app/lib/components/InterviewCard";
import { db, storage } from "@/app/lib/firebase-config";
import { collection } from "firebase/firestore";
import Link from "next/link";
import { useCollection } from "react-firebase-hooks/firestore";
import { useDownloadURL } from "react-firebase-hooks/storage";

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
              <InterviewCard
                key={interview.data().id}
                imgPath={interview.data().picture}
                name={interview.data().name}
                age={interview.data().age}
                answers={interview.data().questions}
              />
            );
          })}
      </div>
    </>
  );
}
