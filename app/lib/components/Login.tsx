import { auth } from "@/app/lib/firebase-config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FormEvent, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Login() {
  const [user, loading, error] = useAuthState(auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // const data = new FormData(e.currentTarget);
    // const email = data.get("email");
    // const password = data.get("password");

    signInWithEmailAndPassword(auth, email, password);
  }

  const logout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div>
        <p>Angemeldeten Nutzer laden...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <p>Fehler: {error.message}</p>
      </div>
    );
  }
  if (user) {
    return (
      <div>
        <p>Aktueller Nutzer: {user.email}</p>
        <button onClick={logout}>Abmelden</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <label>
          Email
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </label>

        <label>
          Passwort
          <input
            type="password"
            name="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </label>
      </fieldset>

      <input type="submit" value="Anmelden" />
    </form>
  );
}
