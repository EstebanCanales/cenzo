"use client";

import { BarChart3, Blocks, ChevronDown, Home, Leaf, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/products", label: "Products", icon: Blocks },
  { href: "/dashboard/graphs", label: "Graphs", icon: BarChart3 },
];

type SidebarClientProps = {
  name: string;
  email: string;
  initials: string;
  onSignOut: () => Promise<void>;
};

export function SidebarClient({ name, email, initials, onSignOut }: SidebarClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Menu size={18} />
        Menu
      </button>

      <aside className={cn("app-sidebar", open && "app-sidebar--open")}>
        <div className="app-sidebar__brand">
          <div className="app-sidebar__logo">
            <Leaf size={16} />
          </div>
          <div>
            <p>Censo</p>
            <span>agri trust layer</span>
          </div>
        </div>

        <nav className="app-sidebar__nav">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                className={cn("app-sidebar__link", active && "app-sidebar__link--active")}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {active ? <span className="app-sidebar__link-indicator" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="app-sidebar__bottom">
          <div className="app-sidebar__story">
            <span>Stellar</span>
            <p>Verifica evidencia y reduce manipulación en la cadena agrícola.</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="sidebar-account" type="button">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <strong style={{ display: "block", fontSize: "11px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {name}
                  </strong>
                  <span style={{ display: "block", fontSize: "10px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {email}
                  </span>
                </div>
                <ChevronDown size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top">
              <form action={onSignOut}>
                <DropdownMenuItem asChild>
                  <button className="dropdown-action-button" type="submit">
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
