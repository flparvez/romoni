import OrderInformationPage from '@/components/OrderInformationPage'
import { SITE_URL } from '@/types/product'
import React from 'react'

const OrderConfirm = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
 const id = (await params).id
  const res  = await fetch(`${SITE_URL}/api/orders/${id}`)

  if (!res.ok) {
    throw new Error('Failed to fetch order confirmation')
  }
  const data = await res.json()

  return (
    <div>
      <OrderInformationPage order={data?.order} />
    </div>
  )
}

export default OrderConfirm
