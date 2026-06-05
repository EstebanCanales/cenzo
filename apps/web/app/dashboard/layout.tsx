import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { auth } from "@/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      {children}
    </div>
  );
}

