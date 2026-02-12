"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
};

export function Pagination({ page, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground px-3">
        صفحة {page} من {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
