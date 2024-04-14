import { ReactNode } from "react";

/**
 * Displays a toolbar at the top of the page
 * @param children - The children to display in the toolbar
 */
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
