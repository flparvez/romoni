// components/RecentOrdersCard.tsx
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { FiExternalLink } from 'react-icons/fi'
import { Badge } from '@/components/ui/badge'
import { IOrder } from '@/models/Order'

interface RecentOrdersCardProps {
  orders: IOrder[]
}

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent orders</p>
          ) : (
            orders?.map((order) => (
              <div key={order._id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/orders/${order._id}`}
                      className="font-medium hover:underline"
                    >
                      #{order.orderId}
                    </Link>
                    <Badge >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.fullName} • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ৳{(order.totalAmount + order.deliveryCharge).toFixed(2)}
                  </p>
                  <Link 
                    href={`/admin/orders/${order._id}`}
                    className="text-sm text-primary hover:underline flex items-center justify-end gap-1"
                  >
                    View <FiExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}