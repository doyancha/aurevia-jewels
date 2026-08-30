'use client';

import { useState, useMemo } from 'react';
import { Product, ProductCategory } from '@/types';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { searchProducts } from '@/data/products';

interface ShopContentProps {
  initialProducts: Product[];
}

export function ShopContent({ initialProducts }: ShopContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [selectedSort, setSelectedSort] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Necklaces',
    'Earrings',
    'Rings',
    'Bangles',
    'Bracelets',
    'Pendants',
    'Bridal Sets',
    'Jewelry Sets',
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let result = initialProducts;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = searchProducts(searchQuery).filter((product) =>
        selectedCategory === 'All' ? true : product.category === selectedCategory
      );
      // Category was already applied above; the search results should preserve the current category filter.
    }

    // Sort
    switch (selectedSort) {
      case 'newest':
        result = [...result].sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
        break;
      case 'price_low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'featured':
      default:
        result = [...result].sort((a, b) => Number(b.featured) - Number(a.featured));
        break;
    }

    return result;
  }, [initialProducts, selectedCategory, searchQuery, selectedSort]);

  return (
    <div className="flex flex-col gap-8">
      <AnimatedSection>
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gray-50 p-6 rounded-2xl">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  selectedCategory === cat
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <input
                type="text"
                placeholder="Search products, collections or product codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Sort */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-white appearance-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600 text-sm">
            Showing {filteredAndSortedProducts.length} result{filteredAndSortedProducts.length !== 1 ? 's' : ''}
          </p>
          {(selectedCategory !== 'All' || searchQuery !== '' || selectedSort !== 'featured') && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSelectedSort('featured');
              }}
              className="text-sm text-primary hover:underline font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {filteredAndSortedProducts.length > 0 ? (
          <ProductGrid products={filteredAndSortedProducts} />
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-serif text-gray-900 mb-2">No jewelry matched your search.</h3>
            <p className="text-gray-500 mb-6">Try a product name, collection, or code.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              View All Products
            </button>
          </div>
        )}
      </AnimatedSection>
    </div>
  );
}
