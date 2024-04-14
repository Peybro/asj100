import { ReactNode } from "react";

/**
 * Displays a loading spinner
 */
export default function LoadingSpinner({ children }: { children: ReactNode }) {
  return <span aria-busy="true">{children}</span>;
}
