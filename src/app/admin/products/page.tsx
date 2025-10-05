import { getAdminProducts } from "@/lib/action";
import ProductsClientPage from "@/components/admin/ProductsClientPage";

// This page is now a Server Component that fetches data at build time (SSG)
// and revalidates it periodically (ISR) based on the cache settings in the action.
export default async function AdminProductsPage() {
  
  // Fetch the initial list of products on the server.
  // Next.js will use the cached version from `getAdminProducts`.
  const initialProducts = await getAdminProducts();

  // Pass the server-fetched data to the client component for interactivity.
  return <ProductsClientPage initialProducts={initialProducts} />;
}
