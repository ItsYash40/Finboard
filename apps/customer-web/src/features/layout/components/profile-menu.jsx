"use client";

import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  KeyRound,
  LogOut,
  Shield,
  UserRound
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ACCOUNT_ITEMS = [
  {
    label: "My profile",
    description: "Name, address & contact",
    href: "/profile",
    icon: UserRound
  },
  {
    label: "Password & security",
    description: "Update your sign-in password",
    href: "/profile?tab=security",
    icon: KeyRound
  },
  {
    label: "Documents",
    description: "PAN & Aadhaar uploads",
    href: "/documents",
    icon: FileCheck2
  }
];

function MenuRow({ item, onSelect }) {
  const Icon = item.icon;

  return (
    <DropdownMenuItem
      className="cursor-pointer gap-3 rounded-xl px-2 py-2.5"
      onClick={() => onSelect(item.href)}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60">
        <Icon className="size-4 text-foreground" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-none">{item.label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{item.description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
    </DropdownMenuItem>
  );
}

export default function ProfileMenu({ user, onLogout }) {
  const router = useRouter();
  const initials = user?.name?.charAt(0)?.toUpperCase() || "?";

  const adminItems = [
    ["admin", "rta_admin"].includes(user?.role)
      ? {
          label: "RTA review",
          description: "Compliance application queue",
          href: "/admin/kyc",
          icon: Shield
        }
      : null,
    ["admin", "amc_admin"].includes(user?.role)
      ? {
          label: "AMC dashboard",
          description: "Fund operations workspace",
          href: "/admin/amc",
          icon: BriefcaseBusiness
        }
      : null
  ].filter(Boolean);

  const roleLabel =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "rta_admin"
        ? "RTA Admin"
        : user?.role === "amc_admin"
          ? "AMC Admin"
          : "Investor";

  function navigate(href) {
    router.push(href);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-full pl-1 pr-2 hover:bg-muted/80"
          aria-label="Open account menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-sm font-semibold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[7.5rem] truncate text-sm font-medium md:inline">
            {user?.name?.split(" ")?.[0] || "Account"}
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground md:inline" aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 overflow-hidden rounded-2xl p-0 shadow-lg ring-1 ring-border/80"
      >
        {/* User header */}
        <div className="border-b border-border/80 bg-muted/30 px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="size-11">
              <AvatarFallback className="bg-primary/15 text-base font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">{user?.name || "Investor"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "mt-3 rounded-full text-[10px] font-semibold uppercase tracking-wide",
              user?.role !== "user" && user?.role !== "investor" && "bg-primary/15 text-primary"
            )}
          >
            {roleLabel}
          </Badge>
        </div>

        {/* Account links */}
        <div className="p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Account
            </DropdownMenuLabel>
            {ACCOUNT_ITEMS.map((item) => (
              <MenuRow key={item.href} item={item} onSelect={navigate} />
            ))}
          </DropdownMenuGroup>

          {adminItems.length ? (
            <>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Admin
                </DropdownMenuLabel>
                {adminItems.map((item) => (
                  <MenuRow key={item.href} item={item} onSelect={navigate} />
                ))}
              </DropdownMenuGroup>
            </>
          ) : null}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Sign out */}
        <div className="p-1.5">
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-3 rounded-xl px-2 py-2.5"
            onClick={onLogout}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <LogOut className="size-4" aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium leading-none">Log out</span>
              <span className="mt-1 block text-xs opacity-80">Sign out of this device</span>
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
