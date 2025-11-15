"use client";

import React, { useState, useEffect, Suspense } from "react";
import { YouTubeEmbed } from "@next/third-parties/google";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Facebook,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageSlider from "./ImageSlider";

import { toast } from "sonner";
import { useAddToCart } from "@/hooks/AddToCart";
import { useCart } from "@/hooks/useCart";
import RelatedProducts from "./ProductByCategory";
import ProductListSkeleton from "../Skelton";
import { IProduct } from "@/types";

interface ProductDetailPageProps {
  product: IProduct;

}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({

  product,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const { addProductToCart } = useAddToCart();
  const { getItem } = useCart();
  const router = useRouter();

  //  datalayer

  useEffect(() => {
    if (typeof window !== "undefined" && product) {
      window.dataLayer = window.dataLayer || [];

      window.dataLayer.push({
        event: "ViewContent", // GTM custom event name (can also use "view_content")
        ecommerce: {
          value: product.price,
          currency: "BDT", // change this if your currency differs
          items: [
            {
              item_id: product._id,
              item_name: product.name,
              item_category: product.category?.name || "Unknown",
              price: product.price,
              discount: product.discount,
              quantity: 1,
              image_url: product.images?.[0]?.url || "",
              slug: product.slug,
            },
          ],
        },
      });
    }
  }, [product]);

  // end

  useEffect(() => {
    setQuantity(1);
    const defaults: Record<string, string> = {};
    if (product.variants?.length) {
      product.variants.forEach((v) => {
        if (v.options?.length) defaults[v.name] = v.options[0].value;
      });
    }
    setSelectedVariants(defaults);
  }, [product]);

  const getVariantInfo = () => {
    let price = product.price;
    let stock = product.stock;
    product.variants?.forEach((v) => {
      const selected = selectedVariants[v.name];
      const opt = v.options?.find((o) => o.value === selected);
      if (opt) {
        price = opt.price ?? price;
        stock = opt.stock ?? stock;
      }
    });
    return { price, stock };
  };

  const { price, stock } = getVariantInfo();
  const cartItem = getItem(product._id, selectedVariants);
  const currentQuantity = cartItem?.quantity || 0;
  const availableStock = stock - currentQuantity;

  const handleAddToCart = () => {
    const requiresVariant = product.variants
      ? product.variants?.length > 0
      : false;
    const selectedAll =
      Object.keys(selectedVariants).length === (product.variants?.length || 0);
    if (requiresVariant && !selectedAll)
      return toast.error("Please select an option before adding to cart.");
    if (availableStock <= 0) return toast.error("Product is out of stock.");

    addProductToCart(product, quantity, selectedVariants);
  };

  const advanced = product.advanced || 100;

  return (
  <div className="mx-auto px-1 py-1 md:py-4 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-gray-100 min-h-screen transition-colors duration-500">
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
      {/* Left Section - Image + Related */}
      <div className="w-full lg:w-1/2 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ImageSlider discount={product.discount} images={product.images} />
        </motion.div>

        <motion.div
          className="hidden sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Suspense fallback={<ProductListSkeleton />}>
            <RelatedProducts
            
              slug={product.category.slug}
              excludeProductId={product._id}
            />
          </Suspense>
        </motion.div>
      </div>

      {/* Right Section - Details */}
      <div className="w-full lg:w-1/2 space-y-3">
        {/* Product Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl sm:text-2xl font-bold text-white drop-shadow-md"
        >
          {product.name}
        </motion.h1>

        {/* Price Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-950 rounded-lg shadow-lg border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-emerald-400 drop-shadow-sm">
              ৳{price}
            </span>
            {product.originalPrice && product.originalPrice > price && (
              <span className="line-through text-sm text-gray-400">
                ৳{product.originalPrice}
              </span>
            )}
            {product.discount ? (
              <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-sm">
                Save {product.discount}%
              </span>
            ) : null}
          </div>
        </motion.div>

        {/* Features (Delivery, Payment, Returns) */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[
            { icon: <Truck className="w-5 h-5 text-blue-400" />, text: "Fast Delivery" },
            { icon: <Shield className="w-5 h-5 text-green-400" />, text: "Secure Payment" },
            { icon: <RotateCcw className="w-5 h-5 text-purple-400" />, text: "Easy Returns" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-500 shadow-sm transition"
            >
              {item.icon}
              <span className="text-xs text-gray-300 text-center font-medium">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 ? (
          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-4">
              {product.variants.map((variant) => (
                <div key={variant.name} className="flex flex-col">
                  <h3 className="text-xs font-semibold text-gray-300 mb-1">
                    {variant.name}:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {variant.options?.map((option) => {
                      const isSelected = selectedVariants[variant.name] === option.value;
                      const isColor = variant.name.toLowerCase() === "color";
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [variant.name]: option.value,
                            }))
                          }
                          className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all shadow-sm ${
                            isColor
                              ? `border-2 ${isSelected ? "border-emerald-400 ring-2 ring-emerald-500" : "border-gray-500 hover:border-gray-300"}`
                              : isSelected
                              ? "bg-emerald-600 text-white border border-emerald-500"
                              : "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600"
                          }`}
                        >
                          {option.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Quantity */}
        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-200">Quantity:</span>
            <span className="text-sm text-gray-400">{availableStock} in stock</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-600 rounded-lg bg-gray-900">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-lg text-gray-300 hover:bg-gray-800"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3 py-1 text-lg font-semibold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                className="px-3 py-2 text-lg text-gray-300 hover:bg-gray-800"
                disabled={quantity >= availableStock}
              >
                +
              </button>
            </div>
            <p className="text-sm text-emerald-400 font-semibold">
              {product.warranty || "No warranty information available."}
            </p>
          </div>
        </div>

        {/* Advance Payment Note */}
        <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <p className="text-sm text-yellow-300 font-medium">
            ⚠️ Note: {advanced} Taka or full payment in advance is required.
          </p>
        </div>

        {/* Sticky Order Button */}
        <div className="fixed sm:bottom-1 bottom-9 left-0 right-0   z-50 px-5 py-3">
          <div className="container mx-auto flex justify-center sm:justify-between items-center">
            <Link
              aria-disabled={product.stock === 0}
              onClick={handleAddToCart}
              href="/checkout"
              className="w-full sm:w-auto animate-bounce py-3 sm:py-4 px-6 sm:px-10 bg-gradient-to-r from-emerald-500 via-orange-500 to-blue-500 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 rounded-xl shadow-lg hover:shadow-emerald-600/40 transition disabled:opacity-70"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {availableStock > 0 ? "ORDER NOW" : "OUT OF STOCK"}
            </Link>
          </div>
        </div>

        {/* Key Specs */}
        {product.specifications && (
          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-100">Key Specifications</h3>
            <div className="grid gap-2">
              {product.specifications.slice(0, 4).map((spec, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b border-gray-700 pb-1">
                  <span className="text-gray-300 font-medium">{spec.key}:</span>
                  <span className="text-gray-100">{spec.value}</span>
                </div>
              ))}
            </div>
            <Link
              href="#full-specifications"
              className="text-emerald-400 text-sm hover:underline mt-3 inline-block"
            >
              View all specifications →
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm overflow-hidden">
          <div className="border-b border-gray-700">
            <nav className="flex -mb-px">
              {["description", "specs"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-emerald-400 text-emerald-400"
                      : "border-transparent text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {tab === "description" ? "Description" : "Specifications"}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-4 text-gray-100">
            {/* Keep your Copy Description logic here */}

            <h3 className="font-bold text-lg mb-2 flex items-center justify-between">
  Product Description
  <button
    onClick={() => {
      if (product.description) {
        navigator.clipboard.writeText(
          product.description.replace(/<[^>]+>/g, "") // optional: strip HTML tags
        );
        toast.success("Product description copied to clipboard!");
      } else {
        toast.error("No description to copy.");
      }
    }}
    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md px-3 py-1 transition"
  >
    Copy Description
  </button>
</h3>

{product.video && (
  <div className="mb-4 rounded-lg overflow-hidden">
    <YouTubeEmbed videoid={product.video} params="controls=1&color=red&rel=0" />
  </div>
)}

<div
  className="prose prose-sm max-w-none text-white "
  dangerouslySetInnerHTML={{
    __html: product.description || "<p>No description available.</p>",
  }}
/>

          </div>
        </div>
      </div>
          {/*  Related Products */}

           <motion.div
          className=" sm:hidden "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
              <h1 className="text-2xl font-bold text-center text-white mt-8 mb-4 drop-shadow-md">
        Related Products
      </h1>
     
          <Suspense fallback={<ProductListSkeleton />}>
            <RelatedProducts
              
              slug={product.category.slug}
              excludeProductId={product._id}
            />
          </Suspense>
        </motion.div>
   
    </div>

  </div>

  
);

};

export default ProductDetailPage;
