// components/DashboardCard.tsx
import { IconType } from 'react-icons'
import { FiDollarSign, FiShoppingCart, FiPackage, FiUsers } from 'react-icons/fi'

type IconName = 'dollar' | 'shopping-cart' | 'package' | 'users'

interface DashboardCardProps {
  title: string
  value: string
  icon: IconName
  description?: string
}

const iconMap: Record<IconName, IconType> = {
  'dollar': FiDollarSign,
  'shopping-cart': FiShoppingCart,
  'package': FiPackage,
  'users': FiUsers
}

export function DashboardCard({ title, value, icon, description }: DashboardCardProps) {
  const Icon = iconMap[icon]
  
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2">
          <h2 className="text-2xl font-bold">{value}</h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}