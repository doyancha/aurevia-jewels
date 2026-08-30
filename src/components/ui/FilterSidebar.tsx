'use client';

import { useState, useEffect } from "react";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  categories: string[];
  collections: string[];
  selectedCategory: string | null;
  selectedCollection: string | null;
  sortBy: string;
  onCategoryChange: (category: string | null) => void;
  onCollectionChange: (collection: string | null) => void;
  onSortChange: (sort: string) => void;
  onClear: () => void;
  resultCount: number;
  className?: string;
}

export function FilterSidebar({
  categories,
  collections,
  selectedCategory,
  selectedCollection,
  sortBy,
  onCategoryChange,
  onCollectionChange,
  onSortChange,
  onClear,
  resultCount,
  className
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Newest Arrivals", value: "newest" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
  ];

  const filterContent = (
    <div className="flex flex-col gap-8 h-full overflow-y-auto pr-2 pb-8">
      {/* Categories */}
      <div>
        <h3 className="font-serif text-lg text-charcoal mb-4 border-b border-champagne-light pb-2">Categories</h3>
        <div className="flex flex-col gap-3">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <div className={cn(
                "w-4 h-4 rounded-sm border flex items-center justify-center transition-colors",
                selectedCategory === category
                  ? "bg-champagne-dark border-champagne-dark"
                  : "border-gray-300 group-hover:border-champagne"
              )}>
                {selectedCategory === category && <X size={12} className="text-white" />}
              </div>
              <span className={cn(
                "font-sans text-sm transition-colors",
                selectedCategory === category ? "text-charcoal font-medium" : "text-charcoal-light group-hover:text-charcoal"
              )}>
                {category}
              </span>
              <input
                type="checkbox"
                className="hidden"
                checked={selectedCategory === category}
                onChange={() => onCategoryChange(selectedCategory === category ? null : category)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Collections */}
      <div>
        <h3 className="font-serif text-lg text-charcoal mb-4 border-b border-champagne-light pb-2">Collections</h3>
        <div className="flex flex-col gap-3">
          {collections.map((collection) => (
            <label key={collection} className="flex items-center gap-3 cursor-pointer group">
              <div className={cn(
                "w-4 h-4 rounded-sm border flex items-center justify-center transition-colors",
                selectedCollection === collection
                  ? "bg-champagne-dark border-champagne-dark"
                  : "border-gray-300 group-hover:border-champagne"
              )}>
                {selectedCollection === collection && <X size={12} className="text-white" />}
              </div>
              <span className={cn(
                "font-sans text-sm transition-colors",
                selectedCollection === collection ? "text-charcoal font-medium" : "text-charcoal-light group-hover:text-charcoal"
              )}>
                {collection}
              </span>
              <input
                type="checkbox"
                className="hidden"
                checked={selectedCollection === collection}
                onChange={() => onCollectionChange(selectedCollection === collection ? null : collection)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Sort By (Mobile Only inside sidebar) */}
      {isMobile && (
        <div>
          <h3 className="font-serif text-lg text-charcoal mb-4 border-b border-champagne-light pb-2">Sort By</h3>
          <div className="flex flex-col gap-3">
            {sortOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                <div className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                  sortBy === option.value
                    ? "border-champagne-dark"
                    : "border-gray-300 group-hover:border-champagne"
                )}>
                  {sortBy === option.value && <div className="w-2 h-2 rounded-full bg-champagne-dark" />}
                </div>
                <span className={cn(
                  "font-sans text-sm transition-colors",
                  sortBy === option.value ? "text-charcoal font-medium" : "text-charcoal-light group-hover:text-charcoal"
                )}>
                  {option.label}
                </span>
                <input
                  type="radio"
                  name="mobile-sort"
                  className="hidden"
                  checked={sortBy === option.value}
                  onChange={() => onSortChange(option.value)}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {(selectedCategory || selectedCollection) && (
        <button
          onClick={onClear}
          className="mt-4 py-2 px-4 border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors text-sm font-medium rounded w-full"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className={className}>
      {/* Mobile Trigger & Top Bar */}
      <div className="lg:hidden flex items-center justify-between py-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-charcoal font-medium"
        >
          <SlidersHorizontal size={20} />
          Filters {(selectedCategory || selectedCollection) && "(Active)"}
        </button>
        <div className="text-sm text-charcoal-light">
          {resultCount} Results
        </div>
      </div>

      {/* Desktop Top Bar (Sort) */}
      <div className="hidden lg:flex items-center justify-between mb-8">
        <div className="text-sm text-charcoal-light">
          Showing {resultCount} Results
        </div>
        <div className="flex items-center gap-3 relative group z-10">
          <span className="text-sm text-charcoal-light">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-transparent pr-8 py-1 font-medium text-charcoal focus:outline-none cursor-pointer border-b border-transparent hover:border-champagne transition-colors"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal" />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        {filterContent}
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <>
          {/* Overlay */}
          <div
            className={cn(
              "fixed inset-0 bg-black/50 z-50 transition-opacity",
              isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div
            className={cn(
              "fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-serif text-2xl text-charcoal">Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-charcoal hover:text-champagne transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 flex-grow overflow-hidden">
              {filterContent}
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-charcoal text-white rounded hover:bg-black transition-colors font-medium"
              >
                Show {resultCount} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}