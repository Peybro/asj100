"use client";

import { db } from "@/app/lib/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useDocument, useDocumentOnce } from "react-firebase-hooks/firestore";

export default function Einstellungen() {
  const [value, loading, error] = useDocumentOnce(
    doc(db, "settings", "settings")
  );

  function safeSettings() {
    console.log(settings);

    const settingsRef = doc(db, "settings", "settings");
    setDoc(settingsRef, settings, { merge: true });
  }

  const [settings, setSettings] = useState({});

  useEffect(() => {
    setSettings(value?.data()!);
  }, [loading]);

  return (
    <>
      <h1>Einstellungen</h1>
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Collection: Loading...</span>}

      {!loading && value && settings && (
        <>
          <h3>Fragen</h3>

          {settings.questions!.map((question, i) => {
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
                      const question = settings.questions[i]!.question;
                      const newExample = e.currentTarget.value;
                      setSettings((prev) => ({
                        ...prev,
                        questions: settings.questions!.toSpliced(i, 1, {
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

          <h3>Datenschutzhinweis</h3>
          <h4>Was passiert mit den Daten?</h4>
          <textarea
            value={settings.datenschutzhinweis!.what}
            onChange={(e) => {
              const newValue = e.currentTarget.value;
              setSettings((prev) => ({
                ...prev,
                datenschutzhinweis: {
                  ...settings.datenschutzhinweis!,
                  what: newValue,
                },
              }));
            }}
          />
          <h4>Wie lange werden sie gespeichert?</h4>
          <textarea
            value={settings.datenschutzhinweis!.howLong}
            onChange={(e) => {
              const newValue = e.currentTarget.value;
              setSettings((prev) => ({
                ...prev,
                datenschutzhinweis: {
                  ...settings.datenschutzhinweis!,
                  howLong: newValue,
                },
              }));
            }}
          />
          <h4>Unter 18?</h4>
          <textarea
            value={settings.datenschutzhinweis!.under18}
            onChange={(e) => {
              const newValue = e.currentTarget.value;
              setSettings((prev) => ({
                ...prev,
                datenschutzhinweis: {
                  ...settings.datenschutzhinweis!,
                  under18: newValue,
                },
              }));
            }}
          />
          <button onClick={safeSettings}>Speichern</button>
        </>
      )}
    </>
  );
}
