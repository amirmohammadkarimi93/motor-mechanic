"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FilterX } from "lucide-react";

interface ServicesFilterProps {
  brands: string[];
  cities: string[];
}

export function ServicesFilter({ brands, cities }: ServicesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get("brand") || "all";
  const initialCity = searchParams.get("city") || "all";
  const [brand, setBrand] = useState(initialBrand);
  const [city, setCity] = useState(initialCity);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBrand(searchParams.get("brand") || "all");
    setCity(searchParams.get("city") || "all");
  }, [searchParams]);

  function applyFilters() {
    const sp = new URLSearchParams();
    if (brand && brand !== "all") sp.set("brand", brand);
    if (city && city !== "all") sp.set("city", city);
    const qs = sp.toString();
    router.push(qs ? `/services?${qs}` : "/services");
  }

  function clearFilters() {
    router.push("/services");
  }

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground shrink-0">
          <Search className="w-4 h-4 text-brand-600" />
          فیلتر برند/شهر:
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="همه برندها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه برندها</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="همه شهرها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه شهرها</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            type="button"
            onClick={applyFilters}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex-1 md:flex-none"
          >
            اعمال فیلتر
          </Button>
          {(brand !== "all" || city !== "all") && (
            <Button
              type="button"
              onClick={clearFilters}
              variant="ghost"
              className="rounded-lg"
              aria-label="حذف فیلتر"
            >
              <FilterX className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
