"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AGE_RATING_ORDER, AGE_RATING_LABELS } from "@/lib/constants";
import { useSearch } from "@/hooks/use-search";
import { cn } from "@/lib/utils";

export function SearchFilters() {
  const { getParam, setParams } = useSearch();
  const currentAgeRating = getParam("ageRating");
  const currentStatus = getParam("status");

  return (
    <div className="space-y-3">
      {/* Age Rating filter */}
      <div>
        <p className="text-sm font-medium mb-2">التصنيف العمري</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!currentAgeRating ? "default" : "outline"}
            size="sm"
            onClick={() => setParams({ ageRating: null })}
          >
            الكل
          </Button>
          {AGE_RATING_ORDER.map((rating) => (
            <Button
              key={rating}
              variant={currentAgeRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setParams({ ageRating: rating })}
            >
              {AGE_RATING_LABELS[rating].ar}
            </Button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div>
        <p className="text-sm font-medium mb-2">حالة التقييم</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!currentStatus ? "default" : "outline"}
            size="sm"
            onClick={() => setParams({ status: null })}
          >
            الكل
          </Button>
          <Button
            variant={currentStatus === "SCANNED" ? "default" : "outline"}
            size="sm"
            onClick={() => setParams({ status: "SCANNED" })}
          >
            مقيّم
          </Button>
          <Button
            variant={currentStatus === "UNSCANNED" ? "default" : "outline"}
            size="sm"
            onClick={() => setParams({ status: "UNSCANNED" })}
          >
            غير مقيّم
          </Button>
        </div>
      </div>
    </div>
  );
}
