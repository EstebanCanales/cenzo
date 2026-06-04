"use client";

import { motion } from "framer-motion";
import { BarChart3, Blocks, Home, Leaf, Menu, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/lotes", label: "Lotes on-chain", icon: ShieldCheck },
  { href: "/dashboard/products", label: "Products", icon: Blocks },
  { href: "/dashboard/graphs", label: "Graphs", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="mobile-sidebar-toggle" onClick={() => setOpen((value) => !value)} type="button">
        <Menu size={18} />
        Menu
      </button>

      <aside className={cn("app-sidebar", open && "app-sidebar--open")}>
        <div className="app-sidebar__brand">
          <div className="app-sidebar__logo">
            <Leaf size={18} />
          </div>
          <div>
            <p>Censo</p>
            <span>Agri trust layer</span>
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
                <Icon size={18} />
                <span>{item.label}</span>
                {active ? <motion.div className="app-sidebar__link-indicator" layoutId="sidebar-indicator" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="app-sidebar__story">
          <span>Stellar trust layer</span>
          <p>Registra movimientos, verifica evidencia y reduce manipulacion en toda la cadena agricola.</p>
        </div>
      </aside>
    </>
  );
}

