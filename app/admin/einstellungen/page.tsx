"use client";

import LoadingSpinner from "@/app/lib/components/LoadingSpinner";
import { db } from "@/app/lib/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useDocumentOnce } from "react-firebase-hooks/firestore";

type Settings = {
  questions: { question: string; example: string }[];
  datenschutzhinweis: {
    what: { heading: string; text: string };
    howLong: { heading: string; text: string };
    under18: { heading: string; text: string };
  };
};

export default function Einstellungen() {
  const [value, loading, error] = useDocumentOnce(
    doc(db, "settings", "settings"),
  );

  function safeSettings() {
    console.log(settings);

    const settingsRef = doc(db, "settings", "settings");
    setDoc(settingsRef, settings, { merge: true });
  }

  const [settings, setSettings] = useState<Settings>({
    questions: [{ question: "", example: "" }],
    datenschutzhinweis: {
      what: { heading: "", text: "" },
      howLong: { heading: "", text: "" },
      under18: { heading: "", text: "" },
    },
  });

  useEffect(() => {
    setSettings(value?.data() as Settings);
  }, [loading]);

  return (
    <>
      <h1>Einstellungen</h1>
      {error && <strong>Fehler: {error.message}</strong>}
      {loading && <LoadingSpinner>Lade Einstellungen...</LoadingSpinner>}

      {!loading && value && settings && (
        <>
          <h3>Fragen</h3>

          {settings.questions.map((question, i) => {
            return (
              <article key={i}>
                <header>Frage {i + 1}</header>

                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => {
                    const newQuestion = e.currentTarget.value;
                    const example = settings.questions[i].example;
                    setSettings((prev) => ({
                      ...prev,
                      questions: settings.questions.toSpliced(i, 1, {
                        question: newQuestion,
                        example,
                      }),
                    }));
                  }}
                />
                <label>
                  Beispiel
                  <input
                    type="text"
                    value={question.example}
                    onChange={(e) => {
                      const question = settings.questions[i].question;
                      const newExample = e.currentTarget.value;
                      setSettings((prev) => ({
                        ...prev,
                        questions: settings.questions.toSpliced(i, 1, {
                          question,
                          example: newExample,
                        }),
                      }));
                    }}
                  />
                </label>
              </article>
            );
          })}

          <button type="submit" className="secondary" disabled>
            Neue Frage
          </button>

          <h3>Datenschutzhinweis</h3>

          <article>
            <input
              type="text"
              value={settings.datenschutzhinweis.what.heading}
              onChange={(e) => {
                const newValue = e.currentTarget.value;
                setSettings((prev) => ({
                  ...prev,
                  datenschutzhinweis: {
                    ...settings.datenschutzhinweis,
                    what: {
                      heading: newValue,
                      text: settings.datenschutzhinweis.what.text,
                    },
                  },
                }));
              }}
            />
            <textarea
              value={settings.datenschutzhinweis.what.text}
              onChange={(e) => {
                const newValue = e.currentTarget.value;
                setSettings((prev) => ({
                  ...prev,
                  datenschutzhinweis: {
                    ...settings.datenschutzhinweis,
                    what: {
                      heading: settings.datenschutzhinweis.what.heading,
                      text: newValue,
                    },
                  },
                }));
              }}
            />
          </article>

          <article>
            <input
              type="text"
              value={settings.datenschutzhinweis.howLong.heading}
              onChange={(e) => {
                const newValue = e.currentTarget.value;
                setSettings((prev) => ({
                  ...prev,
                  datenschutzhinweis: {
                    ...settings.datenschutzhinweis,
                    howLong: {
                      heading: newValue,
                      text: settings.datenschutzhinweis.howLong.text,
                    },
                  },
                }));
              }}
            />
            <textarea
              value={settings.datenschutzhinweis.howLong.text}
              onChange={(e) => {
                const newValue = e.currentTarget.value;
                setSettings((prev) => ({
                  ...prev,
                  datenschutzhinweis: {
                    ...settings.datenschutzhinweis,
                    howLong: {
                      heading: settings.datenschutzhinweis.howLong.heading,
                      text: newValue,
                    },
                  },
                }));
              }}
            />
          </article>

          <article>
            <input
              type="text"
              value={settings.datenschutzhinweis.under18.heading}
              onChange={(e) => {
                const newValue = e.currentTarget.value;
                setSettings((prev) => ({
                  ...prev,
                  datenschutzhinweis: {
                    ...settings.datenschutzhinweis,
                    under18: {
                      heading: newValue,
                      text: settings.datenschutzhinweis.under18.text,
                    },
                  },
                }));
              }}
            />
            <textarea
              value={settings.datenschutzhinweis.under18.text}
              onChange={(e) => {
                const newValue = e.currentTarget.value;
                setSettings((prev) => ({
                  ...prev,
                  datenschutzhinweis: {
                    ...settings.datenschutzhinweis,
                    under18: {
                      heading: settings.datenschutzhinweis.under18.heading,
                      text: newValue,
                    },
                  },
                }));
              }}
            />
          </article>

          <button onClick={safeSettings}>Speichern</button>
        </>
      )}
    </>
  );
}
