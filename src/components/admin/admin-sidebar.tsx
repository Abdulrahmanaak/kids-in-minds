"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Tv,
  Bot,
  Download,
  ClipboardList,
  LogOut,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type NavItem = { href: string; icon: React.ComponentType<{ className?: string }>; label: string };

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "عام",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "لوحة التحكم" },
      { href: "/admin/channels", icon: Tv, label: "القنوات" },
      { href: "/admin/videos", icon: Film, label: "الفيديوهات" },
    ],
  },
  {
    label: "الذكاء الاصطناعي",
    items: [
      { href: "/admin/ai-review", icon: Bot, label: "تقدم المراجعة" },
      { href: "/admin/import", icon: Download, label: "الاستيراد" },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { href: "/admin/review", icon: ClipboardList, label: "المراجعة" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 border-e bg-sidebar min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <Star className="h-6 w-6 text-primary" />
          <span className="font-bold">لوحة الإدارة</span>
        </Link>
      </div>
      <nav className="flex-1 p-3">
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={section.label}>
            {sectionIdx > 0 && <Separator className="my-2" />}
            <p className="text-xs text-muted-foreground font-medium px-3 py-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-e-2 border-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 me-2" />
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  );
}
