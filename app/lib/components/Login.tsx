import { auth } from "@/app/lib/firebase-config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useForm } from "react-hook-form";

export default function Login() {
  // form-hooks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HTMLInputElement>();

  const [user, loading, error] = useAuthState(auth);

  const [loginError, setLoginError] = useState(false);

  async function login(data: {email:string; password:string}) {
    try {
      const email = data.email;
      const password= data.password;

      await signInWithEmailAndPassword(auth, email, password);
      setLoginError(false);
    } catch (error) {
      setLoginError(true);
    }
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
    <form onSubmit={handleSubmit(login)}>
      <fieldset>
        <label>
          Email
          <input
            type="email"
            placeholder="Email"
            {...(Object.hasOwn(errors, "email")
              ? { "aria-invalid": Object.hasOwn(errors, "email") }
              : {})}
            aria-describedby="valid-helper-email"
            {...register("email", {
              required: {
                value: true,
                message: "Bitte Email angeben",
              },
            })}
          />
          {errors.email && (
            <small id="valid-helper-email">
              {errors.email?.message! as string}
            </small>
          )}
        </label>

        <label>
          Passwort
          <input
            type="password"
            placeholder="Passwort"
            {...(Object.hasOwn(errors, "password")
              ? { "aria-invalid": Object.hasOwn(errors, "password") }
              : {})}
            aria-describedby="valid-helper-password"
            {...register("password", {
              required: {
                value: true,
                message: "Bitte Passwort angeben",
              },
            })}
          />
          {errors.password && (
            <small id="valid-helper-password">
              {errors.password?.message! as string}
            </small>
          )}
        </label>
      </fieldset>

      {loginError && <p className="text-red-400">Falsche Anmeldedaten...</p>}
      <input type="submit" value="Anmelden" />
    </form>
  );
}
