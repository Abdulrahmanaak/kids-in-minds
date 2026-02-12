"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Tv,
  Star,
  ClipboardList,
  Download,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "لوحة التحكم" },
  { href: "/admin/channels", icon: Tv, label: "القنوات" },
  { href: "/admin/videos", icon: Film, label: "الفيديوهات" },
  { href: "/admin/review", icon: ClipboardList, label: "المراجعة" },
  { href: "/admin/import", icon: Download, label: "الاستيراد" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 border-e bg-sidebar min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <Star className="h-6 w-6 text-primary" />
          <span className="font-bold">لوحة الإدارة</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
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
