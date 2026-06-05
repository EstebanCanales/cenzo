"use client";

import { BarChart3, Blocks, ChevronDown, Home, Leaf, LogOut, Menu, ShieldCheck, Wallet, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",          label: "Overview",       icon: Home },
  { href: "/dashboard/lotes",    label: "Lotes on-chain", icon: ShieldCheck },
  { href: "/dashboard/products", label: "Products",       icon: Blocks },
  { href: "/dashboard/graphs",   label: "Graphs",         icon: BarChart3 },
];

type SidebarClientProps = {
  name: string;
  email: string;
  initials: string;
  walletAddress?: string | null;
  onSignOut: () => Promise<void>;
};

export function SidebarClient({ name, email, initials, walletAddress, onSignOut }: SidebarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      // Borra la wallet cookie si existe
      await fetch("/api/wallet/session", { method: "DELETE" });
      await onSignOut();
      router.push("/");
      router.refresh();
    });
  }

  const isWallet = Boolean(walletAddress);
  const displayName = isWallet
    ? `${walletAddress!.slice(0, 6)}…${walletAddress!.slice(-4)}`
    : name;
  const displayEmail = isWallet ? "Freighter wallet" : email;

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border border-[var(--line)] bg-white shadow-sm"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open ? <X size={15} /> : <Menu size={15} />}
        Menu
      </button>

      {/* Backdrop mobile */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar rail */}
      <aside
        className={cn(
          "flex flex-col shrink-0 w-[240px] h-dvh",
          "overflow-y-auto overflow-x-hidden [scrollbar-width:none]",
          "border-r border-[var(--line)] bg-[var(--surface)]",
          "max-md:fixed max-md:top-0 max-md:left-0 max-md:z-50 max-md:shadow-xl",
          "max-md:transition-transform max-md:duration-200",
          open ? "max-md:translate-x-0" : "max-md:-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[var(--line)]">
          <div className="w-7 h-7 rounded-lg grid place-items-center bg-[var(--graphite)] text-[var(--green)] shrink-0">
            <Leaf size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold tracking-tight leading-none mb-0.5">Censo</p>
            <span className="text-[10px] text-[var(--muted)]">agri trust layer</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  active
                    ? "bg-[var(--surface-soft)] text-[var(--text-strong)] font-semibold"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-soft)]",
                )}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--green)]" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-2 p-3 pt-0">
          {/* Stellar badge */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2.5">
            <span className="block text-[9px] font-bold tracking-widest uppercase text-[var(--muted)] mb-1">
              Stellar · Soroban
            </span>
            {isWallet ? (
              <p className="text-[10px] font-mono text-[var(--green)] leading-relaxed m-0 truncate">
                {walletAddress}
              </p>
            ) : (
              <p className="text-[10px] text-[var(--muted)] leading-relaxed m-0">
                Verifica evidencia y reduce manipulación en la cadena agrícola.
              </p>
            )}
          </div>

          {/* Account dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg border-t border-[var(--line)] hover:bg-[var(--surface-soft)] transition-colors cursor-pointer"
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[11px]">
                    {isWallet ? <Wallet size={13} /> : initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <strong className="block text-[11px] font-semibold truncate">{displayName}</strong>
                  <span className="block text-[10px] text-[var(--muted)] truncate">{displayEmail}</span>
                </div>
                <ChevronDown size={13} className="text-[var(--muted)] shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-48">
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                disabled={pending}
                onSelect={handleSignOut}
              >
                <LogOut size={14} className="mr-2" />
                {pending ? "Cerrando…" : "Cerrar sesión"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
