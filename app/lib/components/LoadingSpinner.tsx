import { ReactNode } from "react";

type LoadingSpinnerProps = {
  children: ReactNode;
};

/**
 * Displays a loading spinner
 */
export default function LoadingSpinner({ children }: LoadingSpinnerProps) {
  return <span aria-busy="true">{children}</span>;
}
