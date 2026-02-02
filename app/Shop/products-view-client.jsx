"use client";

import { useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";

import {
  SlidersHorizontal,
  X,
  Grid,
  LayoutGrid,
  PanelsTopLeft,
  List,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ProductsViewClient({ products, initialSearchQuery = "" }) {
  const [allProducts] = useState(() => products ?? []);

  // Normalize products with computed values for faster filtering
  const normalizedProducts = useMemo(() => {
    return allProducts.map((p) => {
      const variants = p.variants?.edges || p.variants?.nodes || [];

      // DEBUG LOG
      if (p.madeWith) console.log(`Product: ${p.title}, madeWith Metafield:`, p.madeWith);

      const prices = variants
        .map(v => Number(v.node?.price?.amount || v.price || 0))
        .filter(Boolean);

      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : minPrice;

      const variantValues = variants.flatMap(v => {
        const variant = v.node || v;
        return (variant.selectedOptions || [])
          .map(o => o.value?.toLowerCase().trim())
          .filter(Boolean);
      });

      return {
        ...p,
        _minPrice: minPrice,
        _maxPrice: maxPrice,
        _variantValues: variantValues,
        _vendor: p.vendor?.toLowerCase().trim() || "",
        _productType: p.productType?.toLowerCase().trim() || "",
        _tags: Array.isArray(p.tags)
          ? p.tags.map(t => t.toLowerCase().trim())
          : typeof p.tags === "string"
            ? p.tags.split(",").map(t => t.toLowerCase().trim())
            : [],
        _madeWith: p.madeWith || null,
      };
    });
  }, [allProducts]);

  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Filter options state
  const [madeWithValues, setMadeWithValues] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 99999]);
  const [minMaxPrice, setMinMaxPrice] = useState({ min: 0, max: 99999 });
  const [tags, setTags] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  // Active filters state
  const [selectedMadeWith, setSelectedMadeWith] = useState("all");
  const [selectedVariantOptions, setSelectedVariantOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [gridType, setGridType] = useState("grid3");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Accordion state - first one (collections) open by default
  const [openSections, setOpenSections] = useState({
    madeWith: false,
    priceRange: false,
    variantOptions: false,
    tags: false,
    vendors: false,
    productTypes: true,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => {
      const isCurrentlyOpen = prev[section];

      // close all sections, then open only the clicked one (or close it if already open)
      return Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === section ? !isCurrentlyOpen : false;
        return acc;
      }, {});
    });
  };

  // Sync search query from URL
  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchQuery(query);
  }, [searchParams]);

  // Helper function to extract price from product
  const extractProductPrice = (product) => {
    let minPrice = 0;
    let maxPrice = 0;

    // Method 1: Check priceRangeV2 (latest Shopify structure)
    if (product?.priceRangeV2?.minVariantPrice?.amount) {
      minPrice = parseFloat(product.priceRangeV2.minVariantPrice.amount);
    }

    if (product?.priceRangeV2?.maxVariantPrice?.amount) {
      maxPrice = parseFloat(product.priceRangeV2.maxVariantPrice.amount);
    }

    // Method 2: Check priceRange (older structure)
    if (minPrice === 0 && product?.priceRange?.minVariantPrice?.amount) {
      minPrice = parseFloat(product.priceRange.minVariantPrice.amount);
    }

    if (maxPrice === 0 && product?.priceRange?.maxVariantPrice?.amount) {
      maxPrice = parseFloat(product.priceRange.maxVariantPrice.amount);
    }

    // Method 3: Check variants
    if (minPrice === 0 && product?.variants?.edges?.length > 0) {
      const prices = product.variants.edges.map(edge =>
        parseFloat(edge.node?.price?.amount || 0)
      ).filter(price => price > 0);

      if (prices.length > 0) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
      }
    }

    // Method 4: Direct price field
    if (minPrice === 0 && product?.price) {
      minPrice = parseFloat(product.price);
      maxPrice = parseFloat(product.price);
    }

    // Method 5: Check compareAtPrice
    if (minPrice === 0 && product?.compareAtPrice) {
      minPrice = parseFloat(product.compareAtPrice);
      maxPrice = parseFloat(product.compareAtPrice);
    }

    // If maxPrice is still 0, set it to minPrice
    if (maxPrice === 0) {
      maxPrice = minPrice;
    }

    return { minPrice, maxPrice };
  };

  // Extract all filterable data from products
  useEffect(() => {
    if (!allProducts || allProducts.length === 0) {
      setCollections([]);
      setVariantOptions([]);
      setTags([]);
      setVendors([]);
      setProductTypes([]);
      setMinMaxPrice({ min: 0, max: 99999 });
      setPriceRange([0, 99999]);
      setIsLoading(false);
      return;
    }

    const madeWithSet = new Set();
    const variantOptionsSet = new Set();
    const tagsSet = new Set();
    const vendorsSet = new Set();
    const productTypesSet = new Set();
    let minPrice = Infinity;
    let maxPrice = 0;

    normalizedProducts.forEach((p) => {
      // Made With
      if (p._madeWith) {
        madeWithSet.add(p._madeWith.trim());
      }

      // Price Range
      try {
        if (p._minPrice > 0 && p._minPrice < minPrice) {
          minPrice = p._minPrice;
        }
        if (p._maxPrice > maxPrice) {
          maxPrice = p._maxPrice;
        }
      } catch (e) {
        console.error("Error extracting price:", e);
      }

      // Variant Options
      try {
        const variants = p.variants?.edges || p.variants?.nodes || [];
        variants.forEach((v) => {
          const variant = v.node || v;

          if (variant.selectedOptions && Array.isArray(variant.selectedOptions)) {
            variant.selectedOptions.forEach((opt) => {
              if (opt.value) variantOptionsSet.add(opt.value.trim());
            });
          }

          if (variant.title && variant.title !== "Default Title") {
            variantOptionsSet.add(variant.title.trim());
          }
        });
      } catch (e) {
        console.error("Error extracting variants:", e);
      }

      // Tags
      try {
        if (p.tags) {
          if (typeof p.tags === 'string') {
            p.tags.split(',').forEach(tag => {
              const trimmed = tag.trim();
              if (trimmed) tagsSet.add(trimmed);
            });
          } else if (Array.isArray(p.tags)) {
            p.tags.forEach((tag) => {
              const trimmed = tag.trim();
              if (trimmed) tagsSet.add(trimmed);
            });
          }
        }
      } catch (e) {
        console.error("Error extracting tags:", e);
      }

      // Vendor
      try {
        if (p.vendor) vendorsSet.add(p.vendor.trim());
      } catch (e) {
        console.error("Error extracting vendor:", e);
      }

      // Product Type
      try {
        if (p.productType) productTypesSet.add(p.productType.trim());
      } catch (e) {
        console.error("Error extracting product type:", e);
      }
    });

    // Sort and set
    const sortedMadeWithValues = Array.from(madeWithSet).sort();
    const sortedVariantOptions = Array.from(variantOptionsSet).sort((a, b) =>
      a.localeCompare(b)
    );
    const sortedTags = Array.from(tagsSet).sort();
    const sortedVendors = Array.from(vendorsSet).sort();
    const sortedProductTypes = Array.from(productTypesSet).sort();

    // Handle edge cases for price range
    const flooredMin = minPrice === Infinity ? 0 : Math.floor(minPrice);
    const ceiledMax = maxPrice === 0 ? 99999 : Math.ceil(maxPrice);

    setMadeWithValues(sortedMadeWithValues);
    setVariantOptions(sortedVariantOptions);
    setTags(sortedTags);
    setVendors(sortedVendors);
    setProductTypes(sortedProductTypes);
    setMinMaxPrice({ min: flooredMin, max: ceiledMax });
    setPriceRange([flooredMin, ceiledMax]);
    setIsLoading(false);
  }, [normalizedProducts]);

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    if (isLoading) return [];

    let items = [...normalizedProducts];

    // 1. Search Filter (highest priority)
    if (searchQuery?.trim()) {
      const query = searchQuery.toLowerCase().trim();

      items = items.filter((product) => {
        const title = (product.title || "").toLowerCase();
        const description = (product.description || "").toLowerCase();
        const vendor = (product.vendor || "").toLowerCase();
        const productType = (product.productType || "").toLowerCase();

        // Tags
        let tagsText = "";
        if (Array.isArray(product.tags)) {
          tagsText = product.tags.join(" ").toLowerCase();
        } else if (typeof product.tags === "string") {
          tagsText = product.tags.toLowerCase();
        }

        // Variant titles
        let hasVariantMatch = false;
        const variants = product.variants?.edges || product.variants?.nodes || [];
        for (const v of variants) {
          const variant = v.node || v;
          if (variant.title && variant.title.toLowerCase().includes(query)) {
            hasVariantMatch = true;
            break;
          }
        }

        return (
          title.includes(query) ||
          description.includes(query) ||
          vendor.includes(query) ||
          productType.includes(query) ||
          tagsText.includes(query) ||
          hasVariantMatch
        );
      });
    }

    // 2. Made With Filter
    if (selectedMadeWith !== "all") {
      items = items.filter((p) => p._madeWith === selectedMadeWith);
    }

    // 3. Variant Option Filter (ANY match)
    if (selectedVariantOptions.length > 0) {
      items = items.filter(p =>
        p._variantValues.some(v =>
          selectedVariantOptions.includes(v)
        )
      );
    }

    // 4. Tag Filter (ANY match)
    if (selectedTags.length > 0) {
      items = items.filter(p =>
        selectedTags.some(tag =>
          p._tags.includes(tag.toLowerCase().trim())
        )
      );
    }

    // 5. Vendor Filter (ANY match)
    if (selectedVendors.length > 0) {
      items = items.filter(p =>
        selectedVendors.some(v =>
          p._vendor === v.toLowerCase().trim()
        )
      );
    }

    // 6. Product Type Filter (ANY match)
    if (selectedProductTypes.length > 0) {
      items = items.filter(p =>
        selectedProductTypes.some(t =>
          p._productType === t.toLowerCase().trim()
        )
      );
    }

    // 7. Price Filter (only if range has been adjusted)
    if (
      priceRange[0] > minMaxPrice.min ||
      priceRange[1] < minMaxPrice.max
    ) {
      items = items.filter(p =>
        p._maxPrice >= priceRange[0] &&
        p._minPrice <= priceRange[1]
      );
    }

    // 8. Sorting (applied last)
    switch (sortBy) {
      case "priceLowHigh":
        items.sort((a, b) => a._minPrice - b._minPrice);
        break;

      case "priceHighLow":
        items.sort((a, b) => b._minPrice - a._minPrice);
        break;

      case "titleAZ":
        items.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;

      case "titleZA":
        items.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;

      default:
        // Keep default order
        break;
    }

    return items;
  }, [
    normalizedProducts,
    isLoading,
    searchQuery,
    selectedMadeWith,
    selectedVariantOptions,
    selectedTags,
    selectedVendors,
    selectedProductTypes,
    priceRange,
    sortBy,
    minMaxPrice.min,
    minMaxPrice.max,
  ]);

  const gridClass = {
    grid2: "grid grid-cols-2 gap-6",
    grid3: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6",
    grid4: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6",
    // list: "grid grid-cols-1 gap-6",
  }[gridType];

  const hasActiveFilters =
    selectedMadeWith !== "all" ||
    selectedVariantOptions.length > 0 ||
    selectedTags.length > 0 ||
    selectedVendors.length > 0 ||
    selectedProductTypes.length > 0 ||
    priceRange[0] > minMaxPrice.min ||
    priceRange[1] < minMaxPrice.max;

  const clearAllFilters = () => {
    setSelectedMadeWith("all");
    setSelectedVariantOptions([]);
    setSelectedTags([]);
    setSelectedVendors([]);
    setSelectedProductTypes([]);
    setPriceRange([minMaxPrice.min, minMaxPrice.max]);
    setSearchQuery("");
    router.push("/collection");
  };

  return (
    <>
      <Breadcrumbs />
      <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden fixed bottom-6 right-6 z-50 bg-[#7d4b0e] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 text-lg font-semibold cursor-pointer"
          >
            <SlidersHorizontal size={24} /> Filters
            {hasActiveFilters && (
              <span className="bg-white text-[#7d4b0e] px-2 py-1 rounded-full text-xs font-bold">
                {[
                  selectedMadeWith !== "all" ? 1 : 0,
                  selectedVariantOptions.length,
                  selectedTags.length,
                  selectedVendors.length,
                  selectedProductTypes.length,
                  (priceRange[0] > minMaxPrice.min || priceRange[1] < minMaxPrice.max) ? 1 : 0
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* SIDEBAR FILTERS */}
            <aside
              className={`${showMobileFilters ? "fixed inset-0 z-50 bg-white overflow-y-auto p-6" : "hidden"
                } md:block w-full md:w-80 lg:w-72`}
            >
              {showMobileFilters && (
                <div className="flex justify-between items-center mb-8 border-b pb-4 sticky top-0 bg-white z-10">
                  <h2 className="text-2xl font-bold text-[#7d4b0e]">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="cursor-pointer">
                    <X size={30} className="text-[#7d4b0e]" />
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 sticky top-6 space-y-4">

                {/* PRICE RANGE FILTER - ALWAYS VISIBLE (NO ACCORDION) */}
                <div className="border-b border-amber-100 pb-4">
                  <h3 className="font-semibold text-[#7d4b0e] mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <div className="pt-4 relative h-6">
                      {/* Track background */}
                      <div className="absolute w-full h-2 bg-gray-200 rounded-lg top-2" />

                      {/* Active range */}
                      <div
                        className="absolute h-2 bg-amber-500 rounded-lg top-2 z-10"
                        style={{
                          left: `${((Math.max(minMaxPrice.min, Math.min(priceRange[0] || minMaxPrice.min, minMaxPrice.max)) - minMaxPrice.min) /
                            (minMaxPrice.max - minMaxPrice.min)) *
                            100}%`,
                          right: `${100 -
                            ((Math.min(minMaxPrice.max, Math.max(priceRange[1] || minMaxPrice.max, minMaxPrice.min)) - minMaxPrice.min) /
                              (minMaxPrice.max - minMaxPrice.min)) *
                            100}%`,
                        }}
                      />

                      {/* Min slider */}
                      <input
                        type="range"
                        min={minMaxPrice.min}
                        max={minMaxPrice.max}
                        value={priceRange[0] || minMaxPrice.min}
                        onChange={(e) => {
                          const val = +e.target.value;
                          // Prevent min from exceeding max
                          if (val <= (priceRange[1] || minMaxPrice.max)) {
                            setPriceRange([val, priceRange[1] || minMaxPrice.max]);
                          }
                        }}
                        className="range-input z-20"
                        style={{ position: 'absolute', width: '100%', pointerEvents: 'auto' }}
                      />

                      {/* Max slider */}
                      <input
                        type="range"
                        min={minMaxPrice.min}
                        max={minMaxPrice.max}
                        value={priceRange[1] || minMaxPrice.max}
                        onChange={(e) => {
                          const val = +e.target.value;
                          // Prevent max from going below min
                          if (val >= (priceRange[0] || minMaxPrice.min)) {
                            setPriceRange([priceRange[0] || minMaxPrice.min, val]);
                          }
                        }}
                        className="range-input z-30"
                        style={{ position: 'absolute', width: '100%', pointerEvents: 'auto' }}
                      />
                    </div>

                    <div className="flex justify-between mt-2 text-sm font-medium text-[#7d4b0e]">
                      <span>₹ {priceRange[0] || minMaxPrice.min}</span>
                      <span>₹ {priceRange[1] || minMaxPrice.max}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {/* Min input */}
                        <div className="w-1/2">
                          <label className="block text-xs text-[#7d4b0e] mb-1 font-medium">
                            Min
                          </label>
                          <input
                            type="number"
                            value={priceRange[0] || minMaxPrice.min}
                            onChange={(e) => {
                              const val = +e.target.value;
                              setPriceRange([val, priceRange[1] || minMaxPrice.max]);
                            }}
                            onBlur={() => {
                              let val = priceRange[0] || minMaxPrice.min;
                              if (val < minMaxPrice.min) val = minMaxPrice.min;
                              if (val > (priceRange[1] || minMaxPrice.max)) val = priceRange[1] || minMaxPrice.max;
                              if (val > minMaxPrice.max) val = minMaxPrice.max;
                              setPriceRange([val, priceRange[1] || minMaxPrice.max]);
                            }}
                            className="w-full border rounded px-2 py-1 text-sm text-[#7d4b0e]"
                          />
                        </div>

                        {/* Max input */}
                        <div className="w-1/2">
                          <label className="block text-xs text-[#7d4b0e] mb-1 font-medium">
                            Max
                          </label>
                          <input
                            type="number"
                            value={priceRange[1] || minMaxPrice.max}
                            onChange={(e) => {
                              const val = +e.target.value;
                              setPriceRange([priceRange[0] || minMaxPrice.min, val]);
                            }}
                            onBlur={() => {
                              let val = priceRange[1] || minMaxPrice.max;
                              if (val > minMaxPrice.max) val = minMaxPrice.max;
                              if (val < (priceRange[0] || minMaxPrice.min)) val = priceRange[0] || minMaxPrice.min;
                              if (val < minMaxPrice.min) val = minMaxPrice.min;
                              setPriceRange([priceRange[0] || minMaxPrice.min, val]);
                            }}
                            className="w-full border rounded px-2 py-1 text-sm text-[#7d4b0e]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                {/* PRODUCT TYPES FILTER - ACCORDION */}
                {productTypes.length > 0 && (
                  <div className="border-b border-amber-100 pb-4">
                    <button
                      onClick={() => toggleSection('productTypes')}
                      className="w-full flex items-center justify-between font-semibold text-[#7d4b0e] mb-3 cursor-pointer hover:text-[#6b400c] transition"
                    >
                      <span>Product Types</span>
                      {openSections.productTypes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {openSections.productTypes && (
                      <div className="mt-3 space-y-3 max-h-60 overflow-y-auto animate-fadeIn">
                        {productTypes.map((type) => (
                          <label key={type} className="flex items-center gap-3 cursor-pointer hover:bg-amber-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedProductTypes.includes(type)}
                              onChange={() => {
                                setSelectedProductTypes((prev) =>
                                  prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type]
                                );
                              }}
                              className="w-4 h-4 text-[#7d4b0e] rounded focus:ring-amber-300"
                            />
                            <span className="text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* MADE WITH FILTER - ACCORDION */}
                {madeWithValues.length > 0 && (
                  <div className="border-b border-amber-100 pb-4">
                    {/* Heading / Toggle */}
                    <button
                      onClick={() => toggleSection("madeWith")}
                      className="w-full flex items-center justify-between font-semibold text-[#7d4b0e] mb-3 cursor-pointer hover:text-[#6b400c] transition"
                    >
                      <span>Made with</span>
                      {openSections.madeWith ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>

                    {/* Dropdown Content */}
                    {openSections.madeWith && (
                      <div className="mt-3 space-y-3 max-h-60 overflow-y-auto animate-fadeIn">
                        {madeWithValues.map((val) => (
                          <label
                            key={val}
                            className="flex items-center gap-3 cursor-pointer hover:bg-amber-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMadeWith === val}
                              onChange={() =>
                                setSelectedMadeWith((prev) =>
                                  prev === val ? "all" : val
                                )
                              }
                              className="w-4 h-4 text-[#7d4b0e] rounded focus:ring-amber-300"
                            />
                            <span className="text-gray-700">{val}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* VARIANT OPTIONS FILTER - ACCORDION */}
                {variantOptions.length > 0 && (
                  <div className="border-b border-amber-100 pb-4">
                    <button
                      onClick={() => toggleSection('variantOptions')}
                      className="w-full flex items-center justify-between font-semibold text-[#7d4b0e] mb-3 cursor-pointer hover:text-[#6b400c] transition"
                    >
                      <span>Weight</span>
                      {openSections.variantOptions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {openSections.variantOptions && (
                      <div className="mt-3 space-y-3 max-h-60 overflow-y-auto animate-fadeIn">
                        {variantOptions.map((option) => (
                          <label key={option} className="flex items-center gap-3 cursor-pointer hover:bg-amber-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedVariantOptions.includes(option)}
                              onChange={() => {
                                setSelectedVariantOptions((prev) =>
                                  prev.includes(option)
                                    ? prev.filter((x) => x !== option)
                                    : [...prev, option]
                                );
                              }}
                              className="w-4 h-4 text-[#7d4b0e] rounded focus:ring-amber-300"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAGS FILTER - ACCORDION */}
                {tags.length > 0 && (
                  <div className="border-b border-amber-100 pb-4">
                    <button
                      onClick={() => toggleSection('tags')}
                      className="w-full flex items-center justify-between font-semibold text-[#7d4b0e] mb-3 cursor-pointer hover:text-[#6b400c] transition"
                    >
                      <span>Flavours</span>
                      {openSections.tags ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {openSections.tags && (
                      <div className="mt-3 space-y-3 max-h-60 overflow-y-auto animate-fadeIn">
                        {tags.map((tag) => (
                          <label key={tag} className="flex items-center gap-3 cursor-pointer hover:bg-amber-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag)}
                              onChange={() => {
                                setSelectedTags((prev) =>
                                  prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
                                );
                              }}
                              className="w-4 h-4 text-[#7d4b0e] rounded focus:ring-amber-300"
                            />
                            <span className="text-gray-700">{tag}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* VENDORS FILTER - ACCORDION */}
                {vendors.length > 0 && (
                  <div className="border-b border-amber-100 pb-4">
                    <button
                      onClick={() => toggleSection('vendors')}
                      className="w-full flex items-center justify-between font-semibold text-[#7d4b0e] mb-3 cursor-pointer hover:text-[#6b400c] transition"
                    >
                      <span>Vendors</span>
                      {openSections.vendors ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {openSections.vendors && (
                      <div className="mt-3 space-y-3 max-h-60 overflow-y-auto animate-fadeIn">
                        {vendors.map((vendor) => (
                          <label key={vendor} className="flex items-center gap-3 cursor-pointer hover:bg-amber-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedVendors.includes(vendor)}
                              onChange={() => {
                                setSelectedVendors((prev) =>
                                  prev.includes(vendor) ? prev.filter((x) => x !== vendor) : [...prev, vendor]
                                );
                              }}
                              className="w-4 h-4 text-[#7d4b0e] rounded focus:ring-amber-300"
                            />
                            <span className="text-gray-700">{vendor}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}




                {/* CLEAR ALL FILTERS BUTTON */}
                <button
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className={`w-full py-3 rounded-lg font-semibold transition mt-4 ${hasActiveFilters
                    ? "bg-[#7d4b0e] text-white hover:bg-[#6b400c] cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  Clear All Filters
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 mt-4">
              <h1 className="text-3xl md:text-5xl font-bold text-[#7d4b0e] text-center mb-10">
                Our Products
              </h1>

              {/* SEARCH BOX */}
              <div className="max-w-3xl mx-auto mb-12 px-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const query = searchQuery.trim();
                    if (query) {
                      router.push(`/collection?search=${encodeURIComponent(query)}`);
                    } else {
                      router.push("/collection");
                    }
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder="Search for products, brands, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-5 pr-16 text-lg border-2 border-[#7C4A0E] rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-200 shadow-lg"
                  />
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7C4A0E] hover:scale-110 transition cursor-pointer"
                  >
                    <Search size={28} />
                  </button>
                </form>

                {searchQuery && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        router.push("/collection");
                      }}
                      className="text-[#7d4b0e] underline hover:no-underline cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>

              {/* ACTIVE FILTERS DISPLAY */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {selectedMadeWith !== "all" && (
                    <span className="inline-flex items-center gap-2 bg-amber-100 text-[#7d4b0e] px-4 py-2 rounded-full text-sm font-medium">
                      Made with: {selectedMadeWith}
                      <button onClick={() => setSelectedMadeWith("all")} className="hover:text-[#5a3408]">
                        <X size={16} />
                      </button>
                    </span>
                  )}
                  {selectedVariantOptions.map((option) => (
                    <span
                      key={option}
                      className="inline-flex items-center gap-2 bg-amber-100 text-[#7d4b0e] px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {option}
                      <button
                        onClick={() =>
                          setSelectedVariantOptions((prev) => prev.filter((x) => x !== option))
                        }
                        className="hover:text-[#5a3408]"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 bg-amber-100 text-[#7d4b0e] px-4 py-2 rounded-full text-sm font-medium"
                    >
                      Tag: {tag}
                      <button
                        onClick={() => setSelectedTags((prev) => prev.filter((x) => x !== tag))}
                        className="hover:text-[#5a3408]"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                  {selectedVendors.map((vendor) => (
                    <span
                      key={vendor}
                      className="inline-flex items-center gap-2 bg-amber-100 text-[#7d4b0e] px-4 py-2 rounded-full text-sm font-medium"
                    >
                      Vendor: {vendor}
                      <button
                        onClick={() =>
                          setSelectedVendors((prev) => prev.filter((x) => x !== vendor))
                        }
                        className="hover:text-[#5a3408]"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                  {selectedProductTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-2 bg-amber-100 text-[#7d4b0e] px-4 py-2 rounded-full text-sm font-medium"
                    >
                      Type: {type}
                      <button
                        onClick={() =>
                          setSelectedProductTypes((prev) => prev.filter((x) => x !== type))
                        }
                        className="hover:text-[#5a3408]"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                  {(priceRange[0] > minMaxPrice.min || priceRange[1] < minMaxPrice.max) && (
                    <span className="inline-flex items-center gap-2 bg-amber-100 text-[#7d4b0e] px-4 py-2 rounded-full text-sm font-medium">
                      ₹{priceRange[0]} - ₹{priceRange[1]}
                      <button
                        onClick={() => setPriceRange([minMaxPrice.min, minMaxPrice.max])}
                        className="hover:text-[#5a3408]"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#7d4b0e]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-amber-200 p-2 rounded-lg text-[#7d4b0e] focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    <option value="default">Best Selling</option>
                    <option value="priceLowHigh">Price: Low to High</option>
                    <option value="priceHighLow">Price: High to Low</option>
                    <option value="titleAZ">Name: A to Z</option>
                    <option value="titleZA">Name: Z to A</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGridType("grid2")}
                    className={`p-2 border rounded-lg cursor-pointer transition ${gridType === "grid2" ? "bg-[#7d4b0e] text-white" : "text-[#7d4b0e] hover:bg-amber-50"
                      }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setGridType("grid3")}
                    className={`p-2 border rounded-lg cursor-pointer transition ${gridType === "grid3" ? "bg-[#7d4b0e] text-white" : "text-[#7d4b0e] hover:bg-amber-50"
                      }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setGridType("grid4")}
                    className={`p-2 border rounded-lg cursor-pointer transition ${gridType === "grid4" ? "bg-[#7d4b0e] text-white" : "text-[#7d4b0e] hover:bg-amber-50"
                      }`}
                  >
                    <PanelsTopLeft size={18} />
                  </button>
                </div>
              </div>

              {/* RESULTS COUNT */}
              <p className="text-lg text-gray-700 mb-6">
                {isLoading ? "Loading..." : `${filteredProducts.length} Product${filteredProducts.length !== 1 ? 's' : ''}`}
              </p>

              {/* PRODUCTS GRID */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
                  <p className="text-xl text-gray-600 mt-4">Loading products...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className={gridClass}>
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-amber-50 rounded-lg">
                  <p className="text-xl text-gray-600 mb-4">No products match your filters.</p>
                  <button
                    onClick={clearAllFilters}
                    className="text-[#7d4b0e] underline font-medium cursor-pointer hover:no-underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM STYLES */}
      <style jsx>{`
        .range-input {
          position: absolute;
          width: 100%;
          height: 8px;
          top: 8px;
          background: none;
          pointer-events: none;
          appearance: none;
        }

        .range-input::-webkit-slider-thumb {
          appearance: none;
          pointer-events: auto;
          width: 18px;
          height: 18px;
          background: #f59e0b;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .range-input::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
        }

        .range-input::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          background: #f59e0b;
          border-radius: 9999px;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .range-input::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}