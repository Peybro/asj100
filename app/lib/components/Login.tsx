import { auth } from "@/app/lib/firebase-config"
import { log } from "console";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FormEvent } from "react";
import { useAuthState, useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';

export default function Login() {
    const [user, loading, error] = useAuthState(auth);

    function handleSubmit(e) {
        e.preventDefault();

        const email = e.target.elements.email.value
        const password = e.target.elements.password.value

        signInWithEmailAndPassword(auth, email, password)
    }

    const logout = () => {
        signOut(auth);
    };

    if (loading) {
        return (
            <div>
                <p>Initialising User...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
            </div>
        );
    }
    if (user) {
        return (
            <div>
                <p>Current User: {user.email}</p>
                <button onClick={logout}>Log out</button>
            </div>
        );
    }

    return <form onSubmit={handleSubmit}>
        <fieldset>
            <label>
                Email
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                />
            </label>

            <label>
                Passwort
                <input
                    type="password"
                    name="password"
                    placeholder="Passwort"
                />
            </label>
        </fieldset>

        <input
            type="submit"
            value="Anmelden"
        />
    </form>
}