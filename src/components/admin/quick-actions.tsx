import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Bot, ClipboardList, BarChart3 } from "lucide-react";

export function QuickActions() {
  const actions = [
    { href: "/admin/import", icon: Download, label: "استيراد فيديوهات" },
    { href: "/admin/ai-review", icon: BarChart3, label: "تقدم المراجعة" },
    { href: "/admin/review", icon: ClipboardList, label: "قائمة المراجعة" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">إجراءات سريعة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.href}
            variant="outline"
            className="w-full justify-start"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="h-4 w-4 me-2" />
              {action.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
