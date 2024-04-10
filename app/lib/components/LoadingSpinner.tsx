import { ReactNode } from "react";

export default function LoadingSpinner({ children }: { children: ReactNode }) {
  return <span aria-busy="true">{children}</span>;
}
