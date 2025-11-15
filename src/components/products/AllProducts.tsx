"use client"

import React, { Suspense } from 'react'

import ProductFilter from '../filter/Fiter'
import { ICategory } from '@/types'
import ProductListSkeleton from '../Skelton'

const AllProducts = ({categories}: { categories: ICategory[]}) => {
               
         
                return (
                                <div>
                                  {/*  All Product special title */}

                                  <h2 className="text-xl  text-center sm:text-2xl font-bold ">All Products - A1 Romoni</h2>
                         <Suspense fallback={<ProductListSkeleton />}>
          <ProductFilter categories={categories || []} />
        </Suspense>
                                </div>
                )
}

export default AllProducts
