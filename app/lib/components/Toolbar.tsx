import { ReactNode } from "react";

export default function ToolBar({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <div className="bleed sticky top-0 pt-5 backdrop-blur-md">
        <div className="grid mb-2 container">{children}</div>
        <hr />
      </div>
    </>
  );
}
