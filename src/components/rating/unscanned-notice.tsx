import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function UnscannedNotice() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center gap-3 py-4">
        <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
        <div>
          <p className="font-medium">لم يتم تقييم هذا الفيديو بعد</p>
          <p className="text-sm text-muted-foreground">
            لم يتم فحص هذا الفيديو بعد. سيقوم فريقنا بتقييمه قريباً.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
