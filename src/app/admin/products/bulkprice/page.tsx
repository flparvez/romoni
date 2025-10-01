"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Helper Icon for the loading state
const LoaderIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`animate-spin ${className}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// The main page component, which is the default export
export default function BulkPriceUpdatePage() {
  const [percentage, setPercentage] = useState<number | string>("");
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  const handleOpenConfirm = () => {
    if (Number(percentage) === 0 || percentage === "") {
      toast.info("Please enter a non-zero percentage.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleUpdatePrices = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/products/bulk-price-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percentage: Number(percentage) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong during the update.");
      }

      toast.success(data.message || "Product prices updated successfully!");
      setPercentage(""); // Reset input field after successful update
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Bulk Price Updater</CardTitle>
            <CardDescription className="pt-2">
              Efficiently update all product display prices by a percentage based on their base price.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="e.g., 10 or -5"
                className="h-12 pr-10 text-lg"
                disabled={loading}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
            </div>
            <Button 
              onClick={handleOpenConfirm} 
              disabled={loading}
              className="w-full h-12 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <LoaderIcon className="mr-2 h-5 w-5" />
                  Updating...
                </>
              ) : "Update All Prices"}
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription className="py-2">
              This action will permanently update the display price for all products by 
              <span className="font-bold text-lg"> {percentage}%</span>. 
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleUpdatePrices}>
              Yes, Update Prices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
