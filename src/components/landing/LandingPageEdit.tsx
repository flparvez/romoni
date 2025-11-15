"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Package,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";

import type { ISection, IFAQ } from "@/models/Landing";
import  type { IProductImage, IVariant } from "@/types/index";

/* ───────────────── Types ───────────────── */
interface IProductLite {
  _id: string;
  name: string;
  price: number;
  images?: IProductImage[];
  variants?: IVariant[];
  
reviews?: IProductImage[];
video?: string;
}

interface ILandingForm {
  pageIdentifier: string;
  heroTitle: string;
  heroSubtitle: string;
  logoUrl: string;
  ctaText: string;
  isDeliveryChargeFree: boolean;
  products: string[];
  sections: ISection[];
  contactNumber: string;
  workingHours: string;
  faqTitle: string;
  faqData: IFAQ[];
  footerText: string;
  theme: {
    primary?: string;
    secondary?: string;
    accent?: string;
    darkMode?: boolean;
  };
}

/* ───────────────── Component ───────────────── */
const CreateLandingPage = () => {
  const router = useRouter();

  // Products picker state
  const [products, setProducts] = useState<IProductLite[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productLoading, setProductLoading] = useState<boolean>(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");

  // Form state
  const [saving, setSaving] = useState<boolean>(false);
  const [data, setData] = useState<ILandingForm>({
    pageIdentifier: "",
    heroTitle: "",
    heroSubtitle: "",
    logoUrl: "",
    ctaText: "Order Now",
    isDeliveryChargeFree: false,
    products: [],
    sections: [],
    contactNumber: "",
    workingHours: "",
    faqTitle: "FAQ",
    faqData: [],
    footerText: "",
    theme: { primary: "#2563eb", secondary: "#0ea5e9", accent: "#22c55e", darkMode: false },
  });

  /* ─── Fetch Products (optimized, no-store) ─── */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setProductLoading(true);
      setProductError(null);
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
    
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Failed to load products");
        if (mounted) setProducts(json.products as IProductLite[]);
      } catch (e) {
        if (mounted) setProductError(e instanceof Error ? e.message : "Failed to load products");
      } finally {
        if (mounted) setProductLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ─── Debounced Search ─── */
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const filteredProducts = useMemo(() => {
    if (!debounced) return products;
    return products.filter((p) => p.name.toLowerCase().includes(debounced));
  }, [products, debounced]);

  /* ─── Helpers ─── */
  const setField = <K extends keyof ILandingForm>(k: K, v: ILandingForm[K]) =>
    setData((p) => ({ ...p, [k]: v }));

  const toggleProduct = (id: string) =>
    setSelectedProducts((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const addSection = () =>
    setField("sections", [
      ...data.sections,
      { key: `sec-${Date.now()}`, title: "", order: data.sections.length, bulletPoints: [] },
    ]);

  const updateSectionTitle = (i: number, v: string) =>
    setField("sections", data.sections.map((s, x) => (x === i ? { ...s, title: v } : s)));

  const addBullet = (si: number) =>
    setField(
      "sections",
      data.sections.map((s, x) =>
        x === si ? { ...s, bulletPoints: [...s.bulletPoints, { text: "", order: s.bulletPoints.length }] } : s
      )
    );

  const updateBullet = (si: number, bi: number, v: string) =>
    setField(
      "sections",
      data.sections.map((s, x) =>
        x === si
          ? { ...s, bulletPoints: s.bulletPoints.map((bp, y) => (y === bi ? { ...bp, text: v } : bp)) }
          : s
      )
    );

  const removeBullet = (si: number, bi: number) =>
    setField(
      "sections",
      data.sections.map((s, x) =>
        x === si ? { ...s, bulletPoints: s.bulletPoints.filter((_, y) => y !== bi) } : s
      )
    );

  const removeSection = (i: number) =>
    setField("sections", data.sections.filter((_, x) => x !== i));

  const addFAQ = () =>
    setField("faqData", [...data.faqData, { question: "", answer: "", order: data.faqData.length }]);

  const updateFAQ = (i: number, k: keyof IFAQ, v: string) =>
    setField("faqData", data.faqData.map((f, x) => (x === i ? { ...f, [k]: v } : f)));

  const removeFAQ = (i: number) =>
    setField("faqData", data.faqData.filter((_, x) => x !== i));

  /* ─── Submit ─── */
  const save = async () => {
    if (!data.pageIdentifier.trim()) {
      toast.error("Page Identifier required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, products: selectedProducts }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to create page");
      toast.success("Landing page created 🎉");
      router.push(`/admin/landing/edit/${data.pageIdentifier}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create page");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Theme Preview ─── */
  const heroGradient = useMemo(() => {
    const p = data.theme.primary || "#2563eb";
    const s = data.theme.secondary || "#0ea5e9";
    return `linear-gradient(135deg, ${p} 0%, ${s} 100%)`;
  }, [data.theme.primary, data.theme.secondary]);

  /* ─── UI ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-8"
    >
      <header className="flex items-center justify-center gap-2">
        <Sparkles className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create Landing Page</h1>
      </header>

      {/* HERO */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8" style={{ background: heroGradient }}>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-white/90">Page Identifier</Label>
                <Input
                  className="bg-white/90 backdrop-blur placeholder:text-gray-500"
                  placeholder="e.g. scale-offer"
                  value={data.pageIdentifier}
                  onChange={(e) => setField("pageIdentifier", e.target.value.toLowerCase())}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/90">Hero Title</Label>
                <Input
                  className="bg-white/90"
                  placeholder="Inspire your visitors with a bold headline"
                  value={data.heroTitle}
                  onChange={(e) => setField("heroTitle", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/90">Hero Subtitle</Label>
                <Input
                  className="bg-white/90"
                  placeholder="Explain the key value in one sentence"
                  value={data.heroSubtitle}
                  onChange={(e) => setField("heroSubtitle", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/90">CTA Text</Label>
                <Input
                  className="bg-white/90"
                  placeholder="Order Now"
                  value={data.ctaText}
                  onChange={(e) => setField("ctaText", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={data.isDeliveryChargeFree}
                  onCheckedChange={(v) => setField("isDeliveryChargeFree", v)}
                />
                <Label className="text-white">Free Delivery</Label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid gap-2">
                <Label className="text-white/90 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> Logo URL
                </Label>
                <Input
                  className="bg-white/90"
                  placeholder="https://cdn.example.com/logo.png"
                  value={data.logoUrl}
                  onChange={(e) => setField("logoUrl", e.target.value)}
                />
              </div>
              <div className="rounded-xl bg-white/80 backdrop-blur border shadow-inner p-4 flex items-center justify-center h-[160px]">
                {data.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.logoUrl} alt="Logo preview" className="max-h-32 w-auto object-contain" />
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <ImageIcon className="h-5 w-5" />
                    <span>Logo preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Theme Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-gray-50">
          <div className="grid gap-1">
            <Label>Primary</Label>
            <Input
              type="color"
              value={data.theme.primary || "#2563eb"}
              onChange={(e) => setField("theme", { ...data.theme, primary: e.target.value })}
            />
          </div>
          <div className="grid gap-1">
            <Label>Secondary</Label>
            <Input
              type="color"
              value={data.theme.secondary || "#0ea5e9"}
              onChange={(e) => setField("theme", { ...data.theme, secondary: e.target.value })}
            />
          </div>
          <div className="grid gap-1">
            <Label>Accent</Label>
            <Input
              type="color"
              value={data.theme.accent || "#22c55e"}
              onChange={(e) => setField("theme", { ...data.theme, accent: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 pt-5 sm:pt-0">
            <Switch
              checked={data.theme.darkMode}
              onCheckedChange={(v) => setField("theme", { ...data.theme, darkMode: v })}
            />
            <Label>Dark Mode</Label>
          </div>
        </div>
      </Card>

      {/* PRODUCTS PICKER */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Attach Products</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            Selected: <span className="font-medium">{selectedProducts.length}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Selected Pills */}
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((id) => {
              const p = products.find((x) => x._id === id);
              if (!p) return null;
              return (
                <span
                  key={id}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2 hover:bg-blue-200 transition"
                >
                  {p.name}
                  <button onClick={() => toggleProduct(id)} className="text-red-600 hover:text-red-700">
                    ×
                  </button>
                </span>
              );
            })}
          </div>

          {/* Searchable List */}
          <Command className="border rounded-lg">
            <CommandInput
              placeholder="Search products by name..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-72 overflow-auto">
              {productLoading && <div className="p-3 text-sm text-muted-foreground">Loading products…</div>}
              {productError && <div className="p-3 text-sm text-red-600">{productError}</div>}
              {!productLoading && !productError && (
                <>
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup>
                    {filteredProducts.map((p) => (
                      <CommandItem
                        key={p._id}
                        onSelect={() => toggleProduct(p._id)}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* thumb */}
                          <div className="h-8 w-8 rounded bg-gray-100 overflow-hidden shrink-0 border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {p.images?.[0]?.url ? (
                              <img
                                src={p.images[0].url}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full grid place-items-center text-[10px] text-gray-400">
                                Img
                              </div>
                            )}
                          </div>
                          <div className="truncate">
                            <div className="truncate font-medium">{p.name}</div>
                            <div className="text-xs text-muted-foreground">৳{p.price}</div>
                          </div>
                        </div>
                        {selectedProducts.includes(p._id) && (
                          <span className="text-blue-600 text-sm font-semibold">Selected</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </CardContent>
      </Card>

      {/* SECTIONS */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Content Sections</h2>
          <Button onClick={addSection} size="sm">
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Section
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {data.sections.length === 0 && (
            <div className="text-sm text-gray-500">No sections yet. Click “Add Section”.</div>
          )}

          {data.sections.map((s, si) => (
            <div key={s.key} className="p-4 rounded-xl border bg-white shadow-sm space-y-3">
              <div className="flex gap-2">
                <Input
                  className="bg-gray-50"
                  value={s.title}
                  onChange={(e) => updateSectionTitle(si, e.target.value)}
                  placeholder="Section Title (e.g., Why Choose Us)"
                />
                <Button size="icon" variant="ghost" onClick={() => removeSection(si)} title="Remove section">
                  <Trash2 className="text-red-500" />
                </Button>
              </div>

              {s.bulletPoints.map((bp, bi) => (
                <div key={bi} className="flex gap-2">
                  <Input
                    className="bg-gray-50"
                    value={bp.text}
                    onChange={(e) => updateBullet(si, bi, e.target.value)}
                    placeholder="Bullet point text"
                  />
                  <Button size="icon" variant="ghost" onClick={() => removeBullet(si, bi)} title="Remove bullet">
                    <Trash2 className="text-red-500" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={() => addBullet(si)}>
                <PlusCircle className="w-4 h-4 mr-1" />
                Add Bullet
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <Button size="sm" onClick={addFAQ} variant="outline">
            <PlusCircle className="w-4 h-4 mr-1" />
            Add FAQ
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {data.faqData.length === 0 && (
            <div className="text-sm text-gray-500">No FAQ items yet. Click “Add FAQ”.</div>
          )}
          {data.faqData.map((f, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2">
              <Input
                className="bg-gray-50"
                placeholder="Question"
                value={f.question}
                onChange={(e) => updateFAQ(i, "question", e.target.value)}
              />
              <Input
                className="bg-gray-50"
                placeholder="Answer"
                value={f.answer}
                onChange={(e) => updateFAQ(i, "answer", e.target.value)}
              />
              <Button size="icon" variant="ghost" onClick={() => removeFAQ(i)} title="Remove FAQ">
                <Trash2 className="text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CONTACT + FOOTER */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold">Contact & Footer</h2>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-1">
            <Label>Contact Number</Label>
            <Input
              className="bg-gray-50"
              placeholder="01XXXXXXXX"
              value={data.contactNumber}
              onChange={(e) => setField("contactNumber", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label>Working Hours</Label>
            <Input
              className="bg-gray-50"
              placeholder="10 AM - 10 PM (Daily)"
              value={data.workingHours}
              onChange={(e) => setField("workingHours", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label>Footer Text</Label>
            <Input
              className="bg-gray-50"
              placeholder="© Your Company. All rights reserved."
              value={data.footerText}
              onChange={(e) => setField("footerText", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={save}
        disabled={saving}
        className="w-full mb-4 h-12 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-md"
      >
        {saving ? "Creating..." : "Create Landing Page"}
      </Button>
    </motion.div>
  );
};

export default CreateLandingPage;
