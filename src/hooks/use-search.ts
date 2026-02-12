"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getParam = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams]
  );

  const setParams = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      }
      // Reset to page 1 when filters change
      if (!("page" in params)) {
        newParams.delete("page");
      }
      router.push(`?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  return { getParam, setParams, searchParams };
}
