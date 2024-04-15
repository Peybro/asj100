import { ReactNode } from "react";

type ErrorIndicatorProps = {
  children?: ReactNode;
  error?: Error;
};

/**
 * Displays an error message
 */
export default function ErrorIndicator({
  children,
  error,
}: ErrorIndicatorProps) {
  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold">Fehler</h3>
      {children && <>{children}</>}
      {error && <p>{error.message}</p>}
    </div>
  );
}
