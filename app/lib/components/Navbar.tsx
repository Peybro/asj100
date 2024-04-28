import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/firebase-config";
import { signOut, User } from "firebase/auth";

type NavbarProps = {
  user: User | null | undefined;
};

/**
 * Displays the admin navbar
 */
export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const path = usePathname();

  /**
   * Logs out the current user
   */
  function logout() {
    signOut(auth).then((_) => router.push("/admin"));
  }

  /**
   * Displays the navigation content
   * @returns The navigation content
   */
  function NavContent(): JSX.Element {
    return (
      <>
        <li>
          <Link href="/admin/einsendungen" passHref legacyBehavior>
            <a
              className={`${path.includes("einsendungen") || path.endsWith("admin") ? "text-blue-500" : ""}`}
            >
              Einsendungen
            </a>
          </Link>
        </li>
        <li>
          <Link href="/admin/einstellungen" passHref legacyBehavior>
            <a
              className={`${path.includes("einstellungen") ? "text-blue-500" : ""}`}
            >
              Einstellungen
            </a>
          </Link>
        </li>
        <li>
          <button onClick={logout}>Logout</button>
        </li>
      </>
    );
  }

  return (
    <nav>
      <ul>
        <li>
          <strong>Adminboard</strong>
        </li>
      </ul>
      <ul>
        <li>
          <Link href="/">zum Formular</Link>
        </li>
        {user && (
          <>
            <div className="hidden md:block">
              <NavContent />
            </div>
            <li className="md:hidden">
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
                  <NavContent />
                </ul>
              </details>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
