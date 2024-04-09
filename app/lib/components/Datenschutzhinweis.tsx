"use client";

import { useState } from "react";

export default function DatenschutzhinweisComponent({
  open,
}: {
  open: boolean;
}) {
  const [openState, setOpenState] = useState(open);

  return (
    <>
      <span
        className="text-blue-500"
        onClick={(e) => {
          e.preventDefault();
          setOpenState(true);
        }}
      >
        Datenschutzhinweis
      </span>

      <dialog open={openState} className="modal-is-opening modal-is-closing">
        <article>
          <header>
            <button
              aria-label="Close"
              rel="prev"
              onClick={(e) => {
                e.preventDefault();
                setOpenState(false);
              }}
            ></button>
            <p>
              <strong>Thank You for Registering!</strong>
            </p>
          </header>
          <p>
            We are excited to have you join us for our upcoming event. Please
            arrive at the museum on time to check in and get started.
          </p>
          <ul>
            <li>Date: Saturday, April 15</li>
            <li>Time: 10:00am - 12:00pm</li>
          </ul>
        </article>
      </dialog>
    </>
  );
}
