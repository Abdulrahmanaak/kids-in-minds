"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  defaultValue?: string;
  placeholder?: string;
  size?: "sm" | "lg";
};

export function SearchBar({
  defaultValue = "",
  placeholder = "ابحث بالاسم أو الصق رابط يوتيوب...",
  size = "lg",
}: Props) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`ps-10 ${size === "lg" ? "h-12 text-base" : "h-9 text-sm"}`}
          dir="auto"
        />
      </div>
      <Button type="submit" size={size === "lg" ? "lg" : "default"}>
        بحث
      </Button>
    </form>
  );
}
