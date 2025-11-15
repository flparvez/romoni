import OrderInorderationPage from '@/components/OrderInformationPage'
import { SITE_URL } from '@/hooks/serverApi';
import { IdParams } from '@/types';
import React from 'react'

async function ThankYou({ params }: IdParams) {
                const {id} = await params;
                const res = await fetch(`${SITE_URL}/api/orders/${id}`, {
                                cache: 'no-store',
                })
                const order = await res.json();
      
  if (!order) {
    return <div>Order not found</div>;
  }

  
  return (
    <div>
      <OrderInorderationPage order={order?.order} />
    </div>
  )
}

export default ThankYou
