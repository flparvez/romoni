
import EditProduct from '@/components/admin/Product/Editproduct';
import React from 'react'
interface IdParams {
  params: Promise<{ id: string }>;
}
async function Page({ params }:IdParams ) {
const { id } = await params
  
  return <EditProduct id={id} />;
}

export default Page