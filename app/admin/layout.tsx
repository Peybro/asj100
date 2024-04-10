"use client";

import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase-config";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import Login from "../lib/components/Login";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const path = usePathname();

  const [user, loading, error] = useAuthState(auth);

  function logout() {
    signOut(auth);
    router.push("/admin");
  }

  return (
    <>
      <nav>
        <ul>
          <li>
            <strong>Dashboard</strong>
          </li>
        </ul>
        <ul>
          <li>
            <Link href="/">zum Formular</Link>
          </li>
          {user && (
            <li>
              <details className="dropdown">
                <summary role="button">
                  Menü
                  {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg> */}
                </summary>
                <ul dir="rtl">
                  <li>
                    <Link href="/admin/einsendungen" passHref legacyBehavior>
                      <a
                        style={{
                          color: path.endsWith("einsendungen") ? "#017fc0" : "",
                        }}
                      >
                        Einsendungen
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/einstellungen" passHref legacyBehavior>
                      <a
                        style={{
                          color: path.endsWith("einstellungen")
                            ? "#017fc0"
                            : "",
                        }}
                      >
                        Einstellungen
                      </a>
                    </Link>
                  </li>
                  <li>
                    <button onClick={logout}>Logout</button>
                  </li>
                </ul>
              </details>
            </li>
          )}
        </ul>
      </nav>

      {!user && <Login />}

      {user && children}
    </>
  );
}
