"use client"
import { useCategories } from '@/hooks/DataFetch'
import React, { Suspense } from 'react'

import ProductFilter from '../filter/Fiter'
import { ICategoryRef } from '@/types/iproduct'

const AllProducts = ({categories}: { categories: ICategoryRef[]}) => {
               
         
                return (
                                <div>
                         <Suspense fallback={
          <div className="flex justify-center items-center h-96">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
          </div>
        }>
          <ProductFilter categories={categories || []} />
        </Suspense>
                                </div>
                )
}

export default AllProducts
