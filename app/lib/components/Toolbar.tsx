import { ReactNode } from "react";

export default function ToolBar({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="sticky top-0 pt-5 backdrop-blur-md">
      <div className="grid mb-2">{children}</div>
      <hr />
    </div>
  );
}
