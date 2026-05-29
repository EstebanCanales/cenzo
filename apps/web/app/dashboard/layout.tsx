import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { auth } from "@/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <div className="app-frame">{children}</div>;
}

