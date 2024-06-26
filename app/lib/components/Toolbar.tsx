import { ReactNode } from "react";

/**
 * Displays a toolbar at the top of the page
 * @param children - The children to display in the toolbar
 */
export default function ToolBar({
  children,
  sticky,
}: {
  children: ReactNode;
  sticky?: boolean;
}) {
  return (
    <>
      <div
        className={`bleed ${sticky ? "sticky top-0" : ""} pt-5 backdrop-blur-md`}
      >
        <div className="container mb-2 grid">{children}</div>
        <hr />
      </div>
    </>
  );
}
