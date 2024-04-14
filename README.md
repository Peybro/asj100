# Short Interview Tool for "100 Jahre ASJ Festival"

## Admin Usage
By clicking the logo 5 times you can reveal the link to the admin dashboard (alternatively you can visit `/admin`). After successfully logging in you can inspect all the sent in interviews (alternatively you can visit `/admin/einsendungen`) or change the questions or the privacy policy (alternatively you can visit `/admin/einstellungen`).

## Use for own purposes
To use the application for your own purpose you need to set up a new Firebase project on https://console.firebase.google.com/. Add Authentification (https://firebase.google.com/docs/auth), Firestore Database (https://firebase.google.com/docs/firestore) and Storage (https://firebase.google.com/docs/storage). After that add a new admin and copy your credentials to `"/app/lib/firebase-config.ts"`. You probably also have to add a folder "portraits" in storage and a collection "settings" containing a doc "settings" containing an object of type `{ questions: { question: string; example: string}[]; datenschutzhinweis: { title: string; text: string }[] }` in firebase database.
