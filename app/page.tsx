"use client"

import Image from "next/image";
import asj100 from "./../public/100JahreASJLogo_RGB_4zu3.png"
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [directCam, setDirectCam] = useState(false);

  return (
    <main>
      <div className="flex justify-between">
        <Image src={asj100} alt="Logo für 100 Jahre ASJ" height={130} />
        <Link href="/admin">Dashboard</Link>
      </div>

      <form>
        <fieldset>
          <label>
            Wie heißt du?
            <input
              type='text'
              name="name"
              placeholder="Name"
            />
          </label>

          <label>
            Wie alt bist du?
            <input
              type='number'
              name="age"
              placeholder="Alter"
            />
          </label>

          <label>
            Bild
            <input
              type="file"
              name="picture"
              accept="image/png, image/gif, image/jpeg"
              aria-describedby="picture-helper"
              {...(directCam ? { capture: "environment" } : {})}
            />
            <small id="picture-helper">
              Zeig uns dein schönstes Lächeln!
            </small>
          </label>

          <>
            <label>
              Was war dein Lieblingsmoment in der ASJ?
              <input
                type='text'
                name="question1"
                placeholder=""
                aria-describedby="question1-helper"
              />
              <small id="question1-helper">

              </small>
            </label>

            <label>
              Was hast du für dich aus der ASJ mitgenommen?
              <input
                type='text'
                name="question2"
                placeholder=""
                aria-describedby="question2-helper"
              />
              <small id="question2-helper">

              </small>
            </label>

            <label>
              Was wäre dein Sountrack für die ASJ?
              <input
                type='text'
                name="question3"
                placeholder=""
                aria-describedby="question3-helper"
              />
              <small id="question3-helper">

              </small>
            </label>
          </>

          <label>
            <input name="terms" type="checkbox" role="switch" />
            Ich habe den Datenschutzhinweis gelesen und bin mit dem Speichern meiner Daten einverstanden.
          </label>

        </fieldset>

        <input
          type="submit"
          value="Abschicken"
        />
      </form>

    </main>
  );
}
