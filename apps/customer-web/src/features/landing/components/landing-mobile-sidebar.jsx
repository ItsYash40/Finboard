"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CircleHelp,
  Landmark,
  Map,
  Shield,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeSelector } from "@/components/theme-selector";
import { FinboardMark } from "@/components/ui/finboard-logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { navLinks } from "../data/content";
import { scrollToSection } from "../lib/use-active-section";

const sectionIcons = {
  journey: Map,
  banking: Landmark,
  invest: TrendingUp,
  security: Shield,
  faq: CircleHelp,
};

export default function LandingMobileSidebar({ active, onSelect }) {
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  if (!isMobile) return null;

  const close = () => setOpenMobile(false);

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <FinboardMark size={32} />
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-tight text-sidebar-foreground">
                Finboard
              </p>
              <p className="text-xs text-sidebar-foreground/60">Product tour</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={close}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Explore</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((link) => {
                const Icon = sectionIcons[link.id] ?? Map;
                const isActive = active === link.id;

                return (
                  <SidebarMenuItem key={link.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      size="lg"
                      render={
                        <a
                          href={link.href}
                          onClick={(event) => {
                            event.preventDefault();
                            onSelect(link.id);
                            scrollToSection(link.id);
                            close();
                          }}
                        />
                      }
                    >
                      <Icon aria-hidden />
                      <span className="flex-1">{link.label}</span>
                      <span className="text-xs tabular-nums text-sidebar-foreground/50">
                        {link.index}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel>Appearance</SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <ThemeSelector variant="toggle" />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <Button
          asChild
          className="h-11 w-full gap-2 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <Link href="/signup" onClick={close}>
            Start onboarding
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="mt-2 h-11 w-full rounded-xl border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Link href="/signin" onClick={close}>
            Sign in
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
