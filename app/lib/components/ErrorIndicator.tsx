import { ReactNode } from "react";

export default function ErrorIndicator({
  children,
  error,
}: {
  children?: ReactNode;
  error?: Error;
}) {
  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold">Fehler</h3>
      {children && <>{children}</>}
      {error && <p>{error.message}</p>}
    </div>
  );
}
