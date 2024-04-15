import { ReactNode } from "react";

type ToolbarProps = {
  children: ReactNode;
};

/**
 * Displays a toolbar at the top of the page
 * @param children - The children to display in the toolbar
 */
export default function ToolBar({ children }: ToolbarProps) {
  return (
    <>
      <div className="bleed sticky top-0 pt-5 backdrop-blur-md">
        <div className="grid mb-2 container">{children}</div>
        <hr />
      </div>
    </>
  );
}
