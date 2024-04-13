import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase-config";
import { signOut } from "firebase/auth";

export default function Navbar({ user }: { user: any }) {
  const router = useRouter();
  const path = usePathname();

  function logout() {
    signOut(auth).then(_ => router.push("/admin"));
  }

  return (
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
                      className={`${path.endsWith("einsendungen") ? "text-blue-400" : ""}`}
                    >
                      Einsendungen
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/einstellungen" passHref legacyBehavior>
                    <a
                      className={`${path.endsWith("einstellungen") ? "text-blue-400" : ""}`}
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
  );
}
