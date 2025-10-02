import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { IIProduct, IProductImage } from '@/types/iproduct';
import { SITE_URL } from '@/types/product';
import Footer from '@/components/Footer';

const ProductDetailPage = dynamic(() => import('@/components/products/ProductDetailPage'));
export const dynamicParams = false
type Props = { params: { slug: string } };

export const revalidate = 60; // ISR: 60 seconds

export async function generateStaticParams() {
  const res = await fetch(`${SITE_URL}/api/products`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.products.map((p: IIProduct) => ({ slug: p.slug }));
}

const getProduct = async (slug: string): Promise<IIProduct | null> => {
  try {
const res = await fetch(`${SITE_URL}/api/products/slug/${slug}`, { next: { revalidate: 60 } });

    if (!res.ok) return res.status === 404 ? null : null;
    const data = await res.json();
    return data.product as IIProduct;
  } catch {
    return null;
  }
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found', description: 'Product does not exist.', robots: { index: false, follow: false } };

  const images = product.images?.map((img: IProductImage) => img.url) || [];
  const description = (product.seoDescription || product.name).slice(0, 160);

  return {
    title: `${product.shortName || product.name} Price in Bangladesh - ${product.name}`,
    description,
    keywords: product.seoKeywords?.join(', '),
    alternates: { canonical: `https://a1romoni.vercel.app//product/${product.slug}` },
    openGraph: { title: product.name, description, url: `https://a1romoni.vercel.app//product/${product.slug}`, siteName: 'A1 Romoni', images, type: 'website' },
    twitter: { card: 'summary_large_image', title: product.name, description, images: images[0] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 } },
  };
};

const ProductDetailsPage = async ({ params }: Props) => {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img: IProductImage) => img.url) || [],
    description: product.description?.slice(0, 5000),
    sku: product._id,
    brand: { '@type': 'Brand', name: 'A1 Romoni' },
    offers: {
      '@type': 'Offer',
      url: `https://a1romoni.vercel.app//product/${product.slug}`,
      priceCurrency: 'BDT',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'A1 Romoni' },
    },
  };
    const productRes = await fetch(`${SITE_URL}/api/products`);
    const { products } = await productRes.json();


  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className=" mx-auto px-0 sm:px-6 lg:px-8 py-1">
        <nav aria-label="Breadcrumb" className="py-1 text-sm">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li><Link href="/" className="hover:text-blue-600 hover:underline">Home</Link></li>
            {product.category?.slug && (
              <>
                <li><span>/</span></li>
                <li><Link href={`/category/${product.category.slug}`} className="hover:text-blue-600 hover:underline">{product.category.name}</Link></li>
              </>
            )}
            <li><span>/</span></li>
            <li className="font-semibold text-gray-700 truncate max-w-[200px]" aria-current="page">{product.name}</li>
          </ol>
        </nav>
        <ProductDetailPage products={products} product={product} />
      </div>
      <Footer />
    </main>
  );
};

export default ProductDetailsPage;
