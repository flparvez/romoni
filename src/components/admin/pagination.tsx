import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  className?: string
}

export const Pagination = ({
  currentPage,
  totalPages,
  className,
}: PaginationProps) => {
  const getPageLink = (page: number) => {
    const params = new URLSearchParams()
    params.set("page", page.toString())
    return `/admin/products?${params.toString()}`
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <Button variant="outline" asChild disabled={currentPage <= 1}>
        <Link href={getPageLink(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Link>
      </Button>
      
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>

      <Button variant="outline" asChild disabled={currentPage >= totalPages}>
        <Link href={getPageLink(currentPage + 1)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}