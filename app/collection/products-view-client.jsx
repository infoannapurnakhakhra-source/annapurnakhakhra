"use client";

import { useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Grid,
  LayoutGrid,
  PanelsTopLeft,
  List,
  Search,
} from "lucide-react";

export default function ProductsViewClient({ products, initialSearchQuery = "" }) {
  const [allProducts] = useState(() => products ?? []);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  const [collections, setCollections] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 99999]);
  const [minMaxPrice, setMinMaxPrice] = useState({ min: 0, max: 99999 });
  const [tags, setTags] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  const [category, setCategory] = useState("all");
  const [selectedVariantOptions, setSelectedVariantOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [gridType, setGridType] = useState("grid3");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchQuery(query);
  }, [searchParams]);



  // Helper function to extract price from product - SIMPLIFIED VERSION
  const extractProductPrice = (product) => {
    console.log("Extracting price for product:", product.title);

    let minPrice = 0;
    let maxPrice = 0;

    // Method 1: Check priceRangeV2 (latest Shopify structure)
    if (product?.priceRangeV2?.minVariantPrice?.amount) {
      minPrice = parseFloat(product.priceRangeV2.minVariantPrice.amount);
      console.log("Using priceRangeV2.minVariantPrice:", minPrice);
    }

    if (product?.priceRangeV2?.maxVariantPrice?.amount) {
      maxPrice = parseFloat(product.priceRangeV2.maxVariantPrice.amount);
      console.log("Using priceRangeV2.maxVariantPrice:", maxPrice);
    }

    // Method 2: Check priceRange (older structure)
    if (minPrice === 0 && product?.priceRange?.minVariantPrice?.amount) {
      minPrice = parseFloat(product.priceRange.minVariantPrice.amount);
      console.log("Using priceRange.minVariantPrice:", minPrice);
    }

    if (maxPrice === 0 && product?.priceRange?.maxVariantPrice?.amount) {
      maxPrice = parseFloat(product.priceRange.maxVariantPrice.amount);
      console.log("Using priceRange.maxVariantPrice:", maxPrice);
    }

    // Method 3: Check variants
    if (minPrice === 0 && product?.variants?.edges?.length > 0) {
      const prices = product.variants.edges.map(edge =>
        parseFloat(edge.node?.price?.amount || 0)
      ).filter(price => price > 0);

      if (prices.length > 0) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
        console.log("Using variants prices - min:", minPrice, "max:", maxPrice);
      }
    }

    // Method 4: Direct price field
    if (minPrice === 0 && product?.price) {
      minPrice = parseFloat(product.price);
      maxPrice = parseFloat(product.price);
      console.log("Using direct price field:", minPrice);
    }

    // Method 5: Check compareAtPrice
    if (minPrice === 0 && product?.compareAtPrice) {
      minPrice = parseFloat(product.compareAtPrice);
      maxPrice = parseFloat(product.compareAtPrice);
      console.log("Using compareAtPrice:", minPrice);
    }

    // If maxPrice is still 0, set it to minPrice
    if (maxPrice === 0) {
      maxPrice = minPrice;
    }

    console.log("Final extracted - min:", minPrice, "max:", maxPrice);
    return { minPrice, maxPrice };
  };

  // Extract all filterable data from Shopify products
  useEffect(() => {
    console.log("Products received:", allProducts);

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

    const collectionMap = new Map();
    const variantOptionsSet = new Set();
    const tagsSet = new Set();
    const vendorsSet = new Set();
    const productTypesSet = new Set();
    let minPrice = Infinity;
    let maxPrice = 0;

    allProducts.forEach((p) => {
      // Collections - more flexible extraction
      try {
        const cols = p?.collections?.edges || p?.collections?.nodes || [];
        cols.forEach((col) => {
          const node = col.node || col;
          if (node?.handle && node?.title) {
            collectionMap.set(node.handle, { title: node.title, handle: node.handle });
          }
        });
      } catch (e) {
        console.error("Error extracting collections:", e);
      }

      // Price Range - using helper function
      try {
        const { minPrice: productMinPrice, maxPrice: productMaxPrice } = extractProductPrice(p);

        console.log(`Product ${p.title}: min=${productMinPrice}, max=${productMaxPrice}`);

        // Update global min and max
        if (productMinPrice > 0 && productMinPrice < minPrice) {
          minPrice = productMinPrice;
        }
        if (productMaxPrice > maxPrice) {
          maxPrice = productMaxPrice;
        }
      } catch (e) {
        console.error("Error extracting price:", e);
      }

      // Extract ALL variant option values
      try {
        const variants = p.variants?.edges || p.variants?.nodes || [];
        variants.forEach((v) => {
          const variant = v.node || v;

          // Add all selected option values
          if (variant.selectedOptions && Array.isArray(variant.selectedOptions)) {
            variant.selectedOptions.forEach((opt) => {
              if (opt.value) variantOptionsSet.add(opt.value.trim());
            });
          }

          // Add variant title if it's not "Default Title"
          if (variant.title && variant.title !== "Default Title") {
            variantOptionsSet.add(variant.title.trim());
          }
        });
      } catch (e) {
        console.error("Error extracting variants:", e);
      }

      // Tags - handle both string and array
      try {
        if (p.tags) {
          if (typeof p.tags === 'string') {
            p.tags.split(',').forEach(tag => tagsSet.add(tag.trim()));
          } else if (Array.isArray(p.tags)) {
            p.tags.forEach((tag) => tagsSet.add(tag.trim()));
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
    const sortedCollections = Array.from(collectionMap.values()).sort((a, b) =>
      a.title.localeCompare(b.title)
    );
    const sortedVariantOptions = Array.from(variantOptionsSet).sort((a, b) =>
      a.localeCompare(b)
    );
    const sortedTags = Array.from(tagsSet).sort();
    const sortedVendors = Array.from(vendorsSet).sort();
    const sortedProductTypes = Array.from(productTypesSet).sort();

    // Handle edge cases for price range
    const flooredMin = minPrice === Infinity ? 0 : Math.floor(minPrice);
    const ceiledMax = maxPrice === 0 ? 99999 : Math.ceil(maxPrice);

    console.log("Price Range Calculation:", {
      actualMin: minPrice,
      actualMax: maxPrice,
      calculatedMin: flooredMin,
      calculatedMax: ceiledMax
    });

    setCollections(sortedCollections);
    setVariantOptions(sortedVariantOptions);
    setTags(sortedTags);
    setVendors(sortedVendors);
    setProductTypes(sortedProductTypes);
    setMinMaxPrice({ min: flooredMin, max: ceiledMax });
    setPriceRange([flooredMin, ceiledMax]);
    setIsLoading(false);
  }, [allProducts]);

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    if (isLoading) return [];

    console.log("Filtering products with price range:", priceRange);
    console.log("MinMaxPrice:", minMaxPrice);

    // Start with all products
    let items = [...allProducts];

    console.log("Starting with", items.length, "products");
    console.log("Current search query:", searchQuery);


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

      console.log("After search filter:", items.length, "products left");
    }

    // Category Filter
    if (category !== "all") {
      items = items.filter((p) => {
        try {
          const handles =
            (p?.collections?.edges?.map((e) => e.node?.handle) || []) ||
            (p?.collections?.nodes?.map((n) => n.handle) || []);
          return handles.includes(category);
        } catch (e) {
          console.error("Error filtering by category:", e);
          return false;
        }
      });
      console.log("After category filter:", items.length, "products");
    }

    // Variant Option Filter - ANY match
    if (selectedVariantOptions.length > 0) {
      items = items.filter((product) => {
        try {
          const variants = product.variants?.edges || product.variants?.nodes || [];

          // Check if any variant has ANY of the selected options
          return variants.some((v) => {
            const variant = v.node || v;
            const variantValues = [];

            // Add all selected option values
            if (variant.selectedOptions && Array.isArray(variant.selectedOptions)) {
              variant.selectedOptions.forEach((opt) => {
                if (opt.value) variantValues.push(opt.value.toLowerCase().trim());
              });
            }

            // Add variant title if it's not "Default Title"
            if (variant.title && variant.title !== "Default Title") {
              variantValues.push(variant.title.toLowerCase().trim());
            }

            // Check if ANY selected option is in this variant
            return selectedVariantOptions.some((selected) =>
              variantValues.includes(selected.toLowerCase().trim())
            );
          });
        } catch (e) {
          console.error("Error filtering by variant options:", e);
          return false;
        }
      });
      console.log("After variant filter:", items.length, "products");
    }

    // Tag Filter - ANY match
    if (selectedTags.length > 0) {
      items = items.filter((p) => {
        try {
          let productTags = [];

          if (p.tags) {
            if (typeof p.tags === 'string') {
              productTags = p.tags.split(',').map(t => t.trim().toLowerCase());
            } else if (Array.isArray(p.tags)) {
              productTags = p.tags.map((t) => t.trim().toLowerCase());
            }
          }

          return selectedTags.some((tag) =>
            productTags.includes(tag.trim().toLowerCase())
          );
        } catch (e) {
          console.error("Error filtering by tags:", e);
          return false;
        }
      });
      console.log("After tag filter:", items.length, "products");
    }

    // Vendor Filter
    if (selectedVendors.length > 0) {
      items = items.filter((p) => {
        try {
          if (!p.vendor) return false;

          const productVendor = p.vendor.trim().toLowerCase();
          return selectedVendors.some((vendor) =>
            productVendor === vendor.trim().toLowerCase()
          );
        } catch (e) {
          console.error("Error filtering by vendor:", e);
          return false;
        }
      });
      console.log("After vendor filter:", items.length, "products");
    }

    // Product Type Filter
    if (selectedProductTypes.length > 0) {
      items = items.filter((p) => {
        try {
          if (!p.productType) return false;

          const productType = p.productType.trim().toLowerCase();
          return selectedProductTypes.some((type) =>
            productType === type.trim().toLowerCase()
          );
        } catch (e) {
          console.error("Error filtering by product type:", e);
          return false;
        }
      });
      console.log("After product type filter:", items.length, "products");
    }

    // Price Filter - SIMPLIFIED AND FIXED
    // Only apply price filter if it's different from the min-max range
    if (priceRange[0] > minMaxPrice.min || priceRange[1] < minMaxPrice.max) {
      console.log("Applying price filter:", priceRange);

      items = items.filter((p) => {
        try {
          const { minPrice: productMinPrice, maxPrice: productMaxPrice } = extractProductPrice(p);

          console.log(`Checking product: ${p.title}, Price: ${productMinPrice}-${productMaxPrice}, Filter: ${priceRange[0]}-${priceRange[1]}`);

          // SIMPLE LOGIC: Product should be included if EITHER its min OR max price is within the range
          // OR if the product's price range overlaps with the filter range
          const isInRange =
            (productMinPrice >= priceRange[0] && productMinPrice <= priceRange[1]) ||
            (productMaxPrice >= priceRange[0] && productMaxPrice <= priceRange[1]) ||
            (productMinPrice <= priceRange[0] && productMaxPrice >= priceRange[0]) ||
            (productMinPrice <= priceRange[1] && productMaxPrice >= priceRange[1]);

          console.log(`Result for ${p.title}: ${isInRange}`);
          return isInRange;
        } catch (e) {
          console.error("Error in price filter for product:", p.title, e);
          return true; // Include product if error
        }
      });
      console.log("After price filter:", items.length, "products remaining");
    }

    // Sorting
    switch (sortBy) {
      case "priceLowHigh":
        items.sort((a, b) => {
          try {
            const { minPrice: aPrice } = extractProductPrice(a);
            const { minPrice: bPrice } = extractProductPrice(b);
            return aPrice - bPrice;
          } catch (e) {
            console.error("Error sorting by price:", e);
            return 0;
          }
        });
        break;
      case "priceHighLow":
        items.sort((a, b) => {
          try {
            const { minPrice: aPrice } = extractProductPrice(a);
            const { minPrice: bPrice } = extractProductPrice(b);
            return bPrice - aPrice;
          } catch (e) {
            console.error("Error sorting by price:", e);
            return 0;
          }
        });
        break;
      case "titleAZ":
        items.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "titleZA":
        items.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      default:
        break;
    }

    console.log("Final filtered products count:", items.length);

    return items;
  }, [
    allProducts,
    isLoading,
    searchQuery,
    category,
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
    list: "grid grid-cols-1 gap-6",
  }[gridType];

  const hasActiveFilters =
    category !== "all" ||
    selectedVariantOptions.length > 0 ||
    selectedTags.length > 0 ||
    selectedVendors.length > 0 ||
    selectedProductTypes.length > 0 ||
    priceRange[0] > minMaxPrice.min ||
    priceRange[1] < minMaxPrice.max;

  // Debug function to check product prices
  const debugProductPrices = () => {
    console.log("=== DEBUG: All Product Prices ===");
    allProducts.forEach((p, index) => {
      const { minPrice, maxPrice } = extractProductPrice(p);
      console.log(`${index + 1}. ${p.title}: ₹${minPrice} - ₹${maxPrice}`);
    });
    console.log("=== DEBUG END ===");
  };

  return (
    <>
      <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Debug button - remove in production */}
          <button
            onClick={debugProductPrices}
            className="hidden fixed bottom-20 right-6 z-50 bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Debug Prices
          </button>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden fixed bottom-6 right-6 z-50 bg-[#7d4b0e] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 text-lg font-semibold"
          >
            <SlidersHorizontal size={24} /> Filters
          </button>

          <div className="flex flex-col md:flex-row gap-8">
            <aside
              className={`${showMobileFilters ? "fixed inset-0 z-50 bg-white overflow-y-auto p-6" : "hidden"
                } md:block w-full md:w-80 lg:w-72`}
            >
              {showMobileFilters && (
                <div className="flex justify-between items-center mb-8 border-b pb-4 sticky top-0 bg-white z-10">
                  <h2 className="text-2xl font-bold text-[#7d4b0e]">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X size={30} className="text-[#7d4b0e]" />
                  </button>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 sticky top-6">
                <h3 className="font-semibold text-[#7d4b0e] mb-4">Category</h3>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border p-3 rounded-lg text-[#7d4b0e]"
                >
                  <option value="all">All Collections</option>
                  {collections.map((col) => (
                    <option key={col.handle} value={col.handle}>
                      {col.title}
                    </option>
                  ))}
                </select>

                <h3 className="font-semibold text-[#7d4b0e] mb-4 mt-8">Price Range</h3>
                <div className="space-y-4">

                  <div className="pt-4">
                    <div className="relative h-6">
                      {/* Min slider */}
                      <input
                        type="range"
                        min={minMaxPrice.min}
                        max={minMaxPrice.max}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const val = Math.min(+e.target.value, priceRange[1] - 1);
                          setPriceRange([val, priceRange[1]]);
                        }}
                        className="range-input z-20"
                      />

                      {/* Max slider */}
                      <input
                        type="range"
                        min={minMaxPrice.min}
                        max={minMaxPrice.max}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const val = Math.max(+e.target.value, priceRange[0] + 1);
                          setPriceRange([priceRange[0], val]);
                        }}
                        className="range-input z-10"
                      />

                      {/* Active range */}
                      <div
                        className="absolute h-2 bg-amber-500 rounded-lg top-2"
                        style={{
                          left: `${((priceRange[0] - minMaxPrice.min) / (minMaxPrice.max - minMaxPrice.min)) * 100}%`,
                          right: `${100 - ((priceRange[1] - minMaxPrice.min) / (minMaxPrice.max - minMaxPrice.min)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>


                  <div className="flex justify-between mt-2 text-sm font-medium text-[#7d4b0e]">
                    <span>₹ {priceRange[0]}</span>
                    <span>₹ {priceRange[1]}</span>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Min: ₹{minMaxPrice.min} | Max: ₹{minMaxPrice.max}
                  </div>
                </div>

                <h3 className="font-semibold text-[#7d4b0e] mb-4 mt-8">Variant Options</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {variantOptions.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
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
                        className="w-4 h-4 text-[#7d4b0e] rounded"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>

                <h3 className="font-semibold text-[#7d4b0e] mb-4 mt-8">Tags</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {tags.map((tag) => (
                    <label key={tag} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => {
                          setSelectedTags((prev) =>
                            prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
                          );
                        }}
                        className="w-4 h-4 text-[#7d4b0e] rounded"
                      />
                      <span className="text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>

                <h3 className="font-semibold text-[#7d4b0e] mb-4 mt-8">Vendors</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {vendors.map((vendor) => (
                    <label key={vendor} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor)}
                        onChange={() => {
                          setSelectedVendors((prev) =>
                            prev.includes(vendor) ? prev.filter((x) => x !== vendor) : [...prev, vendor]
                          );
                        }}
                        className="w-4 h-4 text-[#7d4b0e] rounded"
                      />
                      <span className="text-gray-700">{vendor}</span>
                    </label>
                  ))}
                </div>

                <h3 className="font-semibold text-[#7d4b0e] mb-4 mt-8">Product Types</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {productTypes.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProductTypes.includes(type)}
                        onChange={() => {
                          setSelectedProductTypes((prev) =>
                            prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type]
                          );
                        }}
                        className="w-4 h-4 text-[#7d4b0e] rounded"
                      />
                      <span className="text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setCategory("all");
                    setSelectedVariantOptions([]);
                    setSelectedTags([]);
                    setSelectedVendors([]);
                    setSelectedProductTypes([]);
                    setPriceRange([minMaxPrice.min, minMaxPrice.max]);
                  }}
                  className="w-full bg-[#7d4b0e] text-white py-3 rounded-lg font-semibold hover:bg-[#6b400c] transition mt-8"
                >
                  Clear All Filters
                </button>
              </div>
            </aside>

            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold text-[#7d4b0e] text-center mb-10">
                Our Collections
              </h1>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {category !== "all" && collections.find((c) => c.handle === category) && (
                    <span className="inline-flex items-center gap-2 bg-amber-100 text-[#7d4b0e] px-4 py-2 rounded-full text-sm font-medium">
                      {collections.find((c) => c.handle === category).title}
                      <button onClick={() => setCategory("all")}>
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
                      {tag}
                      <button
                        onClick={() => setSelectedTags((prev) => prev.filter((x) => x !== tag))}
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
                      {vendor}
                      <button
                        onClick={() =>
                          setSelectedVendors((prev) => prev.filter((x) => x !== vendor))
                        }
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
                      {type}
                      <button
                        onClick={() =>
                          setSelectedProductTypes((prev) => prev.filter((x) => x !== type))
                        }
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                  {(priceRange[0] > minMaxPrice.min || priceRange[1] < minMaxPrice.max) && (
                    <span className="inline-flex items-center gap-2 bg-amber-100 text-[#7d4b0e] px-4 py-2 rounded-full text-sm font-medium">
                      ₹{priceRange[0]} - ₹{priceRange[1]}
                      <button onClick={() => setPriceRange([minMaxPrice.min, minMaxPrice.max])}>
                        <X size={16} />
                      </button>
                    </span>
                  )}
                </div>
              )}
              <div>
                {/* SEARCH BOX - ONLY ON COLLECTION PAGE */}
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7C4A0E] hover:scale-110 transition"
                    >
                      <Search size={28} />
                    </button>
                  </form>

                  {/* Current Search Display */}
                  {searchQuery && (
                    <div className="mt-6 text-center">
                      {/* <p className="text-xl text-[#7d4b0e]">
                      Showing results for: <strong>"{searchQuery}"</strong>
                    </p> */}
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          router.push("/collection");
                        }}
                        className="mt-3 text-[#7d4b0e] underline hover:no-underline"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              </div>


              <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#7d4b0e]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border p-2 rounded-lg text-[#7d4b0e]"
                  >
                    <option value="default">Best selling</option>
                    <option value="priceLowHigh">Price: Low to High</option>
                    <option value="priceHighLow">Price: High to Low</option>
                    <option value="titleAZ">Name: A to Z</option>
                    <option value="titleZA">Name: Z to A</option>
                  </select>
                </div>



                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGridType("grid2")}
                    className={`p-2 border rounded-lg ${gridType === "grid2" ? "bg-[#7d4b0e] text-white" : "text-[#7d4b0e]"
                      }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setGridType("grid3")}
                    className={`p-2 border rounded-lg ${gridType === "grid3" ? "bg-[#7d4b0e] text-white" : "text-[#7d4b0e]"
                      }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setGridType("grid4")}
                    className={`p-2 border rounded-lg ${gridType === "grid4" ? "bg-[#7d4b0e] text-white" : "text-[#7d4b0e]"
                      }`}
                  >
                    <PanelsTopLeft size={18} />
                  </button>
                  <button
                    onClick={() => setGridType("list")}
                    className={`p-2 border rounded-lg ${gridType === "list" ? "bg-[#7d4b0e] text-white" : "text-[#7d4b0e]"
                      }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>

              <p className="text-lg text-gray-700 mb-6">
                {isLoading ? "Loading..." : `${filteredProducts.length} Products`}
              </p>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">Loading products...</p>
                </div>
              ) : (
                <div className={gridClass}>
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}

              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">No products match your filters.</p>
                  <button
                    onClick={() => {
                      setCategory("all");
                      setSelectedVariantOptions([]);
                      setSelectedTags([]);
                      setSelectedVendors([]);
                      setSelectedProductTypes([]);
                      setPriceRange([minMaxPrice.min, minMaxPrice.max]);
                    }}
                    className="mt-4 text-[#7d4b0e] underline font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
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
}

.range-input::-moz-range-thumb {
  pointer-events: auto;
  width: 18px;
  height: 18px;
  background: #f59e0b;
  border-radius: 9999px;
  cursor: pointer;
}
`}
      </style>
    </>
  );
}