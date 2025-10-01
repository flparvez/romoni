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
export default function BulkOriginalPricePage() {
  const [percentage, setPercentage] = useState<number | string>("");
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  const handleOpenConfirm = () => {
    const numPercentage = Number(percentage);
    if (isNaN(numPercentage) || numPercentage <= 0) {
      toast.info("Please enter a positive percentage (e.g., 25).");
      return;
    }
    setConfirmOpen(true);
  };

  const handleUpdate = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      const res = await fetch("/api/products/bulk-original-price-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percentage: Number(percentage) }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }
      
      toast.success(data.message);
      setPercentage(""); // Clear input on success
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
            <CardTitle className="text-2xl font-bold">Bulk Original Price Setter</CardTitle>
            <CardDescription className="pt-2">
              Set the strikethrough 'Original Price' to be a percentage higher than the 'Base Price' for all products.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="e.g., 25 (for 25% higher)"
                className="h-12 pr-10 text-lg"
                disabled={loading}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
            </div>
            <Button onClick={handleOpenConfirm} disabled={loading} className="w-full h-12 text-lg font-semibold">
              {loading ? (
                <>
                  <LoaderIcon className="mr-2 h-5 w-5" />
                  Applying...
                </>
              ) : "Set All Original Prices"}
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Price Update</DialogTitle>
            <DialogDescription className="py-2">
              This will set the 'Original Price' for all products to be 
              <span className="font-bold text-lg"> {percentage}%</span> higher than their base price. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleUpdate}>
              Yes, I'm Sure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
