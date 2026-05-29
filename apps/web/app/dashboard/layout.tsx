import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { UserMenu } from "@/components/dashboard/user-menu";
import { auth, signOut } from "@/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const name = session.user.name ?? "Agricultural operator";
  const email = session.user.email ?? "operator@censo.local";

  return (
    <div className="app-frame">
      <div className="app-frame__toolbar">
        <UserMenu
          email={email}
          name={name}
          onSignOut={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        />
      </div>
      {children}
    </div>
  );
}

