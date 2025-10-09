import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IIProduct, IProductImage } from '@/types/iproduct';
import { SITE_URL } from '@/types/product';
import Footer from '@/components/Footer';
import ProductDetailPage from '@/components/products/ProductDetailPage'; // Remove dynamic import

export const dynamicParams = false;
type Props = { params: { slug: string } };

export const revalidate = 60; // ISR: 60 seconds

// Optimized fetch function with caching headers
const fetchWithCache = async (url: string, options: RequestInit = {}) => {
  try {
    const res = await fetch(url, {
      ...options,
      next: { 
        revalidate: 60,
        tags: ['products']
      },
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        ...options.headers,
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
};

// Enhanced generateStaticParams with error handling
export async function generateStaticParams() {
  try {
    const data = await fetchWithCache(`${SITE_URL}/api/products`);
    
    if (!data?.products || !Array.isArray(data.products)) {
      console.warn('No products found or invalid response format');
      return [];
    }
    
    // Limit to first 100 products for build optimization
    return data.products.slice(0, 100).map((p: IIProduct) => ({ 
      slug: p.slug 
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Optimized product fetching
const getProduct = async (slug: string): Promise<IIProduct | null> => {
  const data = await fetchWithCache(`${SITE_URL}/api/products/slug/${slug}`);
  return data?.product || null;
};

// Fetch all products for the component
const getAllProducts = async (): Promise<IIProduct[]> => {
  const data = await fetchWithCache(`${SITE_URL}/api/products`);
  return data?.products || [];
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const product = await getProduct(params.slug);
  
  if (!product) {
    return { 
      title: 'Product Not Found', 
      description: 'Product does not exist.', 
      robots: { index: false, follow: false } 
    };
  }

  const images = product.images?.map((img: IProductImage) => img.url) || [];
  const description = (product.seoDescription || product.name).slice(0, 160);

  // Fixed URL - removed double slash
  const productUrl = `https://a1romoni.vercel.app/product/${product.slug}`;

  return {
    title: `${product.shortName || product.name} Price in Bangladesh - ${product.name}`,
    description,
    keywords: product.seoKeywords?.join(', '),
    alternates: { 
      canonical: productUrl 
    },
    openGraph: { 
      title: product.name, 
      description, 
      url: productUrl, 
      siteName: 'A1 Romoni', 
      images, 
      type: 'website' 
    },
    twitter: { 
      card: 'summary_large_image', 
      title: product.name, 
      description, 
      images: images[0] 
    },
    robots: { 
      index: true, 
      follow: true, 
      googleBot: { 
        index: true, 
        follow: true, 
        'max-snippet': -1, 
        'max-image-preview': 'large', 
        'max-video-preview': -1 
      } 
    },
  };
};

const ProductDetailsPage = async ({ params }: Props) => {
  // Fetch both product and products in parallel for optimal performance
  const [productResult, productsResult] = await Promise.allSettled([
    getProduct(params.slug),
    getAllProducts()
  ]);

  // Handle results with proper error checking
  const product = productResult.status === 'fulfilled' ? productResult.value : null;
  const products = productsResult.status === 'fulfilled' ? productsResult.value : [];

  if (!product) {
    notFound();
  }

  // Fixed URL - removed double slash
  const productUrl = `https://a1romoni.vercel.app/product/${product.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img: IProductImage) => img.url) || [],
    description: product.description?.slice(0, 5000),
    sku: product._id,
    brand: { 
      '@type': 'Brand', 
      name: 'A1 Romoni' 
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BDT',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { 
        '@type': 'Organization', 
        name: 'A1 Romoni' 
      },
    },
  };

  return (
    <main>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <div className="mx-auto px-0 sm:px-6 lg:px-8 py-0">
        <nav aria-label="Breadcrumb" className="py-1 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <Link 
                href="/" 
                className="hover:text-blue-600 hover:underline transition-colors"
              >
                Home
              </Link>
            </li>
            {product.category?.slug && (
              <>
                <li><span>/</span></li>
                <li>
                  <Link 
                    href={`/category/${product.category.slug}`} 
                    className="hover:text-blue-600 hover:underline transition-colors"
                  >
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <li><span>/</span></li>
            <li 
              className="font-semibold text-gray-700 truncate max-w-[200px]" 
              aria-current="page"
            >
              {product.name}
            </li>
          </ol>
        </nav>
        
        {/* Direct component import - no dynamic loading */}
        <ProductDetailPage 
          products={products} 
          product={product} 
        />
      </div>
      <Footer />
    </main>
  );
};

export default ProductDetailsPage;