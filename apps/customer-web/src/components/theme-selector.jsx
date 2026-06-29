"use client";

import { useEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

function ThemeIcon({ theme, resolvedTheme, className }) {
  if (theme === "system") {
    return <Laptop className={className} aria-hidden />;
  }

  if (resolvedTheme === "light") {
    return <Sun className={className} aria-hidden />;
  }

  return <Moon className={className} aria-hidden />;
}

export function ThemeSelector({ variant = "menu", className, buttonClassName }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (variant === "toggle") {
    const current = mounted ? theme : "dark";

    return (
      <div
        role="radiogroup"
        aria-label="Theme"
        className={cn(
          "inline-flex w-full items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 sm:w-fit",
          className
        )}
      >
        {THEMES.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.value;

          return (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={item.label}
              onClick={() => setTheme(item.value)}
              className={cn(
                "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors sm:flex-none sm:px-4",
                isActive
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-full", buttonClassName)}
            aria-label="Choose theme"
          />
        }
      >
        <ThemeIcon
          theme={mounted ? theme : "dark"}
          resolvedTheme={mounted ? resolvedTheme : "dark"}
          className="size-4"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuRadioGroup value={mounted ? theme : "dark"} onValueChange={setTheme}>
          {THEMES.map((item) => (
            <DropdownMenuRadioItem key={item.value} value={item.value}>
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
