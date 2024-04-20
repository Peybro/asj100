import { auth } from "@/firebase-config";
import { signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { SubmitHandler, useForm } from "react-hook-form";
import ErrorIndicator from "@/components/ErrorIndicator";

type LoginProps = {
  user: User | null | undefined;
  loading: boolean;
  error: Error | undefined;
};

type FormData = {
  email: string;
  password: string;
};

/**
 * Displays a login form
 */
export default function Login({ user, loading, error }: LoginProps) {
  // form-hooks
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  /**
   * Logs in a user
   * @param loginObject - The login object containing email and password
   */
  const handleLogin: SubmitHandler<FormData> = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      reset();
    } catch (error) {
      setError("root", {
        message: "Falsche Anmeldedaten...",
      });
    }
  };

  /**
   * Logs out the current user
   */
  const handleLogout = () => {
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
    return <ErrorIndicator error={error} />;
  }

  return (
    <article>
      <h2>Login</h2>

      <form onSubmit={handleSubmit(handleLogin)}>
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
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Bitte gültige Email angeben",
                },
              })}
            />
            {errors.email && (
              <small id="valid-helper-email">{errors.email?.message}</small>
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
                {errors.password?.message}
              </small>
            )}
          </label>
        </fieldset>

        <input
          type="submit"
          value={isSubmitting ? "Meldet an..." : "Anmelden"}
          disabled={isSubmitting}
        />
        {errors.root && (
          <small aria-invalid="true">{errors.root?.message}</small>
        )}
      </form>
    </article>
  );
}
