'use client';

import React, { useState, useEffect } from 'react';
import { YouTubeEmbed } from '@next/third-parties/google';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  Facebook,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ImageSlider from './ImageSlider';
import { IIProduct } from '@/types/iproduct';
import { toast } from 'sonner';
import { useAddToCart } from '@/hooks/AddToCart';
import { useCart } from '@/hooks/useCart';

import RelatedProducts from './ProductByCategory';

interface ProductDetailPageProps {
  product: IIProduct;
  products: IIProduct[];
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  products,
  product,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const { addProductToCart } = useAddToCart();
  const { getItem } = useCart();
  const router = useRouter();

  // ✅ Default variants select
  useEffect(() => {
    setQuantity(1);
    const defaultVariants: Record<string, string> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant) => {
        if (variant.options && variant.options.length > 0) {
          defaultVariants[variant.name] = variant.options[0].value;
        }
      });
    }
    setSelectedVariants(defaultVariants);
  }, [product]);

  // ✅ Price + Stock from selected variant
  const getSelectedVariantInfo = () => {
    if (!product.variants || product.variants.length === 0) {
      return { price: product.displayPrice, stock: product.stock };
    }
    let variantPrice = product.price;
    let variantStock = product.stock;
    for (const variant of product.variants) {
      const selectedOption = selectedVariants[variant.name];
      if (selectedOption) {
        const option = variant.options?.find(
          (opt) => opt.value === selectedOption
        );
        if (option) {
          variantPrice = option.price ?? variantPrice;
          variantStock = option.stock ?? variantStock;
        }
      }
    }
    return { price: variantPrice, stock: variantStock };
  };

  const { price, stock } = getSelectedVariantInfo();
  const cartItem = getItem(product._id, selectedVariants);
  const currentQuantity = cartItem?.quantity || 0;
  const availableStock = stock - currentQuantity;


  // ✅ Buy Now
  const onBuyNow = () => {
    
    if (availableStock <= 0) {
      toast.error('Product is out of stock.');
      return;
    }
    addProductToCart(product, quantity, selectedVariants);
    router.push('/checkout');
  };

  return (
    <div className="mx-auto px-2 sm:px-4 py-2 bg-gradient-to-b from-white to-orange-50 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Image Section */}
        <div className="w-full lg:w-1/2 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <ImageSlider discount={product.discount} images={product.images} />
          </motion.div>

          {/* Related Products - desktop */}
          <motion.div
            className="hidden sm:block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <RelatedProducts
              products={products}
              slug={product.category.slug}
              excludeProductId={product._id}
            />
          </motion.div>
        </div>

        {/* Details Section */}
        <div className="w-full lg:w-1/2 space-y-4">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl sm:text-3xl font-bold text-gray-900"
          >
            {product.name}
          </motion.h1>

          {/* Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4 p-3 bg-white rounded-lg shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-red-600">৳{price}</span>
              {product.originalPrice && product.originalPrice > price && (
                <span className="line-through text-sm text-gray-500">
                  ৳{product.originalPrice}
                </span>
              )}
              {product.discount ? (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                  Save {product.discount}%
                </span>
              ) : null}
            </div>
          </motion.div>

          {/* USP badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-3 gap-2"
          >
            {[
              { icon: <Truck className="w-5 h-5 text-blue-600" />, text: 'Fast Delivery' },
              { icon: <Shield className="w-5 h-5 text-green-600" />, text: 'Secure Payment' },
              { icon: <RotateCcw className="w-5 h-5 text-purple-600" />, text: 'Easy Returns' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm"
              >
                {item.icon}
                <span className="text-xs text-gray-700 text-center">{item.text}</span>
              </div>
            ))}
          </motion.div>

        {/* Variants */}
<div className="flex flex-wrap gap-6 mt-6">
  {product.variants?.map((variant, i) => (
    <motion.div
      key={variant.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: i * 0.1 }}
      className="flex flex-col"
    >
      <h3 className="text-sm font-semibold mb-2">{variant.name}</h3>
      <div className="flex flex-wrap gap-2">
        {variant.options?.map((option) => {
          const isSelected =
            selectedVariants[variant.name] === option.value;
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
              className={`border rounded-lg flex items-center justify-center transition-all ${
                isColor
                  ? "w-9 h-9"
                  : "px-4 py-2 text-sm"
              } ${
                isSelected
                  ? "border-blue-600 bg-blue-50 font-semibold"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              style={
                isColor
                  ? {
                      backgroundColor: option.value,
                      borderRadius: "50%",
                    }
                  : {}
              }
            >
              {isColor ? (
                isSelected && <Check className="w-4 h-4 text-white" />
              ) : (
                option.value
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  ))}
</div>

          {/* Quantity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="p-3 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Quantity:</span>
              <span className="text-sm text-gray-600">{availableStock} in stock</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-lg text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="px-3 py-2 text-lg text-gray-600 hover:bg-gray-100"
                  disabled={quantity >= availableStock}
                >
                  +
                </button>
              </div>
              <p className="text-sm text-green-600 font-semibold">
                {product.warranty || '7 day return policy.'}
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl z-50 p-3 lg:static lg:p-0 lg:border-none lg:shadow-none"
          >
            <div className="flex flex-col sm:flex-row gap-2">
           
              <button
                onClick={onBuyNow}
                disabled={availableStock <= 0}
                className="flex-1 py-2 px-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {availableStock <= 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>
          </motion.div>

          {/* Specifications & Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="border-b border-gray-200 flex">
              {['description', 'specs'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'description' ? 'Description' : 'Specifications'}
                </button>
              ))}
            </div>
            <div className="p-4">
              <AnimatePresence mode="wait">
                {activeTab === 'description' && (
                  <motion.div
                    key="desc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {product.video && (
                      <div className="mb-4 aspect-video rounded-lg overflow-hidden">
                        <YouTubeEmbed
                          videoid={product.video}
                          params="controls=1&color=red&rel=0"
                        />
                      </div>
                    )}
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: product.description || '<p>No description available.</p>',
                      }}
                    />
                  </motion.div>
                )}
                {activeTab === 'specs' && (
                  <motion.div
                    key="specs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="font-semibold text-lg mb-3">
                      Full Specifications
                    </h3>
                    {product.specifications ? (
                      <div className="space-y-2">
                        {product.specifications.map((spec, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between py-2 border-b border-gray-100"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {spec.key}
                            </span>
                            <span className="text-sm text-gray-900">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No specifications available.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related Products - mobile */}
      <div className="block sm:hidden mt-6">
        <RelatedProducts
          products={products}
          slug={product.category.slug}
          excludeProductId={product._id}
        />
      </div>

      {/* Floating Facebook */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="fixed bottom-24 sm:bottom-6 right-4 z-50"
      >
        <Link
          href="https://www.facebook.com/a1ladiesfr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
        >
          <Facebook size={24} />
        </Link>
      </motion.div>
    </div>
  );
};

export default ProductDetailPage;
