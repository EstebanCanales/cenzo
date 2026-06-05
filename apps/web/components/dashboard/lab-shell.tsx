import { ReactNode } from "react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { cn } from "@/lib/utils";

type LabShellProps = {
  heading: string;
  eyebrow: string;
  description: string;
  variant?: "default" | "overview" | "products" | "graphs";
  hideHeader?: boolean;
  actions?: ReactNode;
  children: ReactNode;
};

export function LabShell({
  heading,
  eyebrow,
  description,
  variant = "default",
  hideHeader = false,
  actions,
  children,
}: LabShellProps) {
  return (
    <>
      {/* Sidebar — fixed rail, no scroll visible */}
      <AppSidebar />

      {/* Main content — full height, scrolleable */}
      <main
        className={cn(
          "flex-1 min-w-0 h-dvh overflow-y-auto",
          "px-8 py-7",
          variant === "overview" && "lab-layout--overview",
        )}
      >
        {!hideHeader && (
          <header className="lab-header">
            <div className="lab-header__copy">
              <p className="lab-kicker">{eyebrow}</p>
              <h1>{heading}</h1>
              <p>{description}</p>
            </div>
            {actions ? <div className="lab-header__actions">{actions}</div> : null}
          </header>
        )}
        <div className="lab-content">{children}</div>
      </main>
    </>
  );
}
