import { auth } from "@/app/lib/firebase-config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useForm } from "react-hook-form";
import ErrorIndicator from "./ErrorIndicator";

interface IFormData {
  email: string;
  password: string;
}

/**
 * Displays a login form
 */
export default function Login({ user, loading, error }) {
  // form-hooks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormData>();

  const [loginError, setLoginError] = useState(false);

  /**
   * Logs in a user
   * @param loginObject - The login object containing email and password
   */
  async function login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginError(false);
      reset();
    } catch (error) {
      setLoginError(true);
    }
  }

  /**
   * Logs out the current user
   */
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

      {loginError && (
        <ErrorIndicator>
          <p className="text-red-400">Falsche Anmeldedaten...</p>
        </ErrorIndicator>
      )}
      <input type="submit" value="Anmelden" />
    </form>
  );
}
