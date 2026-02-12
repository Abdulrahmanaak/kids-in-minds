"use client";

import { Button } from "@/components/ui/button";
import { AGE_RATING_ORDER, AGE_RATING_LABELS } from "@/lib/constants";
import { useSearch } from "@/hooks/use-search";

export function SafeListFilters() {
  const { getParam, setParams } = useSearch();
  const currentRating = getParam("ageRating") || "PG";

  return (
    <div>
      <p className="text-sm font-medium mb-2">الحد الأقصى للتصنيف العمري</p>
      <div className="flex flex-wrap gap-2">
        {AGE_RATING_ORDER.map((rating) => (
          <Button
            key={rating}
            variant={currentRating === rating ? "default" : "outline"}
            size="sm"
            onClick={() => setParams({ ageRating: rating })}
          >
            {AGE_RATING_LABELS[rating].ar}
          </Button>
        ))}
      </div>
    </div>
  );
}
