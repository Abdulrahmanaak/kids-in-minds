import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <h3 className="font-bold text-lg mb-3">{APP_NAME}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة تساعد الآباء السعوديين في تقييم مدى ملاءمة مقاطع يوتيوب
              للأطفال وفق المعايير الإسلامية والثقافية السعودية.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">روابط سريعة</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/safe-list" className="hover:text-foreground transition-colors">
                القائمة الآمنة
              </Link>
              <Link href="/submit" className="hover:text-foreground transition-colors">
                أرسل فيديو للتقييم
              </Link>
              <Link href="/disclaimer" className="hover:text-foreground transition-colors">
                إخلاء المسؤولية
              </Link>
            </nav>
          </div>
          <div>
            <h4 className="font-semibold mb-3">معلومات</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              التقييمات استرشادية فقط. القرار النهائي يعود لولي الأمر.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
