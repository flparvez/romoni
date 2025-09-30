import Footer from '@/components/Footer';
import AllProducts from '@/components/products/AllProducts'
import { SITE_URL } from '@/types/product';
import React from 'react'

const page =async () => {
                    const res = await fetch(`${SITE_URL}/api/categories`, {
      next: { revalidate: 60 }, // ISR support for categories too
    });
    const { categories } = await res.json();

                return (
                                <div>
                                                <AllProducts categories={categories} />
                                                            <Footer />
                                </div>
                )
}

export default page
