import { auth, signOut } from "@/auth";

import { SidebarClient } from "./sidebar-client";

export async function AppSidebar() {
  const session = await auth();
  const name = session?.user?.name ?? "Agricultural operator";
  const email = session?.user?.email ?? "operator@censo.local";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarClient
      email={email}
      initials={initials}
      name={name}
      onSignOut={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    />
  );
}
