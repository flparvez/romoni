"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
} from "@/components/ui/command";

import { ISection, IFAQ } from "@/models/Landing";
import { ArrowUp, ArrowDown, Image as ImageIcon, Link as LinkIcon, Package, Sparkles, Trash2, PlusCircle } from "lucide-react";

import  type { IProductImage, IVariant } from "@/types/index";

interface IProductLite {
  _id: string;
  name: string;
  price: number;
  images?: IProductImage[];
  variants?: IVariant[];
  
reviews?: IProductImage[];
video?: string;
}

interface ILandingData {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  logoUrl: string;
  ctaText: string;
  isDeliveryChargeFree: boolean;
  sections: ISection[];
  contactNumber: string;
  workingHours: string;
  faqTitle: string;
  faqData: IFAQ[];
  footerText: string;
  products: string[];
  theme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    darkMode?: boolean;
  };
}

const moveItem = <T,>(arr: T[], from: number, to: number) => {
  const copy = [...arr];
  const item = copy.splice(from, 1)[0];
  copy.splice(to, 0, item);
  return copy.map((it, idx) =>
    typeof (it as any)?.order === "number" ? ({ ...(it as any), order: idx } as T) : it
  );
};

const LandingPageEditor = ({id}: { id: string}) => {
 
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ILandingData | null>(null);

  const [products, setProducts] = useState<IProductLite[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/landing/${id}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Failed to fetch");
        const landing: ILandingData = json.landing;
        if (!landing.theme) landing.theme = { primary: "#2563eb", secondary: "#0ea5e9", accent: "#22c55e", darkMode: false };
        setData(landing);
      // Normalize product IDs from landing data
const normalizedProductIds = (landing.products || []).map((p: any) =>
  typeof p === "string" ? p : p._id
);

setSelectedProducts(normalizedProductIds);
      } catch {
        toast.error("Failed to load landing page");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadProducts = async () => {
      const res = await fetch("/api/products", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setProducts(json.products as IProductLite[]);
    };
    loadProducts();
  }, []);

  const setField = <K extends keyof ILandingData>(key: K, value: ILandingData[K]) =>
    setData((prev) => (prev ? { ...prev, [key]: value } : prev));

  const toggleProductSelection = (productId: string) =>
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

  const addSection = () =>
    setData((prev) =>
      prev
        ? {
            ...prev,
            sections: [
              ...prev.sections,
              { key: `sec-${Date.now()}`, title: "", order: prev.sections.length, bulletPoints: [] },
            ],
          }
        : prev
    );

  const updateSectionTitle = (i: number, v: string) =>
    setData((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      sections[i] = { ...sections[i], title: v };
      return { ...prev, sections };
    });

  const removeSection = (i: number) =>
    setData((prev) => {
      if (!prev) return prev;
      const sections = prev.sections.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx }));
      return { ...prev, sections };
    });

  const moveSectionUp = (i: number) =>
    setData((prev) => (prev && i > 0 ? { ...prev, sections: moveItem(prev.sections, i, i - 1) } : prev));

  const moveSectionDown = (i: number) =>
    setData((prev) =>
      prev && i < prev.sections.length - 1 ? { ...prev, sections: moveItem(prev.sections, i, i + 1) } : prev
    );

  const addBullet = (si: number) =>
    setData((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      const s = sections[si];
      const bulletPoints = [...s.bulletPoints, { text: "", order: s.bulletPoints.length }];
      sections[si] = { ...s, bulletPoints };
      return { ...prev, sections };
    });

  const updateBullet = (si: number, bi: number, v: string) =>
    setData((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      const s = sections[si];
      const bulletPoints = [...s.bulletPoints];
      bulletPoints[bi] = { ...bulletPoints[bi], text: v };
      sections[si] = { ...s, bulletPoints };
      return { ...prev, sections };
    });

  const removeBullet = (si: number, bi: number) =>
    setData((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      const s = sections[si];
      const bulletPoints = s.bulletPoints.filter((_, idx) => idx !== bi).map((bp, idx) => ({ ...bp, order: idx }));
      sections[si] = { ...s, bulletPoints };
      return { ...prev, sections };
    });

  const moveBulletUp = (si: number, bi: number) =>
    setData((prev) => {
      if (!prev || bi === 0) return prev;
      const sections = [...prev.sections];
      const s = sections[si];
      const bulletPoints = moveItem(s.bulletPoints, bi, bi - 1);
      sections[si] = { ...s, bulletPoints };
      return { ...prev, sections };
    });

  const moveBulletDown = (si: number, bi: number) =>
    setData((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      const s = sections[si];
      if (bi >= s.bulletPoints.length - 1) return prev;
      const bulletPoints = moveItem(s.bulletPoints, bi, bi + 1);
      sections[si] = { ...s, bulletPoints };
      return { ...prev, sections };
    });

  const addFAQ = () =>
    setData((prev) =>
      prev ? { ...prev, faqData: [...prev.faqData, { question: "", answer: "", order: prev.faqData.length }] } : prev
    );

  const updateFAQ = (i: number, k: keyof IFAQ, v: string) =>
    setData((prev) => {
      if (!prev) return prev;
      const faq = [...prev.faqData];
      faq[i] = { ...faq[i], [k]: v };
      return { ...prev, faqData: faq };
    });

  const removeFAQ = (i: number) =>
    setData((prev) => {
      if (!prev) return prev;
      const faq = prev.faqData.filter((_, idx) => idx !== i).map((f, idx) => ({ ...f, order: idx }));
      return { ...prev, faqData: faq };
    });

  const heroGradient = useMemo(() => {
    const p = data?.theme?.primary || "#2563eb";
    const s = data?.theme?.secondary || "#0ea5e9";
    return `linear-gradient(135deg, ${p} 0%, ${s} 100%)`;
  }, [data?.theme?.primary, data?.theme?.secondary]);

  const handleSubmit = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/landing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, products: selectedProducts }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      toast.success("Saved successfully");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div className="p-8 text-center">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-8"
    >
      <header className="flex items-center justify-center gap-2">
        <Sparkles className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Landing: {data.id}</h1>
      </header>

      {/* HERO */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8" style={{ background: heroGradient }}>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-white/90">Hero Title</Label>
                <Input className="bg-white/90" value={data.heroTitle} onChange={(e) => setField("heroTitle", e.target.value)} placeholder="Bold headline" />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/90">Hero Subtitle</Label>
                <Input className="bg-white/90" value={data.heroSubtitle} onChange={(e) => setField("heroSubtitle", e.target.value)} placeholder="One-line value prop" />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/90">CTA Text</Label>
                <Input className="bg-white/90" value={data.ctaText} onChange={(e) => setField("ctaText", e.target.value)} placeholder="Order Now" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={data.isDeliveryChargeFree} onCheckedChange={(v) => setField("isDeliveryChargeFree", v)} />
                <Label className="text-white">Free Delivery</Label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid gap-2">
                <Label className="text-white/90 flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Logo URL</Label>
                <Input className="bg-white/90" value={data.logoUrl} onChange={(e) => setField("logoUrl", e.target.value)} placeholder="https://cdn.example.com/logo.png" />
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

        {/* Theme strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-gray-50">
          <div className="grid gap-1">
            <Label>Primary</Label>
            <Input
              type="color"
              value={data.theme?.primary || "#2563eb"}
              onChange={(e) => setField("theme", { ...(data.theme || {}), primary: e.target.value })}
            />
          </div>
          <div className="grid gap-1">
            <Label>Secondary</Label>
            <Input
              type="color"
              value={data.theme?.secondary || "#0ea5e9"}
              onChange={(e) => setField("theme", { ...(data.theme || {}), secondary: e.target.value })}
            />
          </div>
          <div className="grid gap-1">
            <Label>Accent</Label>
            <Input
              type="color"
              value={data.theme?.accent || "#22c55e"}
              onChange={(e) => setField("theme", { ...(data.theme || {}), accent: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 pt-5 sm:pt-0">
            <Switch checked={Boolean(data.theme?.darkMode)} onCheckedChange={(v) => setField("theme", { ...(data.theme || {}), darkMode: v })} />
            <Label>Dark Mode</Label>
          </div>
        </div>
      </Card>

      {/* PRODUCTS */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Products</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
  {selectedProducts.map((id) => {
    const p = products.find((x) => x._id === id);
    if (!p) return null;
    return (
      <div key={id} className="flex items-center gap-3 border p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={p.images?.[0]?.url || "/placeholder.png"} 
          alt={p.name} 
          className="w-14 h-14 object-cover rounded-md border"
        />
        <div className="flex-1">
          <p className="font-medium text-sm">{p.name}</p>
          <p className="text-xs text-muted-foreground">৳ {p.price}</p>
        </div>
        <button onClick={() => toggleProductSelection(id)} className="text-red-600 hover:text-red-700">
          ×
        </button>
      </div>
    );
  })}
</div>

          <Command className="border rounded-lg">
            <CommandInput placeholder="Search products..." />
            <CommandList className="max-h-64 overflow-auto">
              <CommandGroup>
                {products.map((p) => (
                  <CommandItem key={p._id} onSelect={() => toggleProductSelection(p._id)} className="flex justify-between cursor-pointer">
                    <span className="truncate">{p.name}</span>
                    {selectedProducts.includes(p._id) && <span className="text-blue-600 font-semibold">✔</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CardContent>
      </Card>

      {/* SECTIONS with Up/Down reorder */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Content Sections</h2>
          <Button onClick={addSection} size="sm" variant="default">
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Section
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {data.sections.length === 0 && <div className="text-sm text-gray-500">No sections yet. Click “Add Section”.</div>}

          {data.sections.map((s, si) => (
            <div key={s.key} className="p-4 rounded-xl border bg-white shadow-sm space-y-3">
              <div className="flex gap-2">
                <Input className="bg-gray-50" value={s.title} onChange={(e) => updateSectionTitle(si, e.target.value)} placeholder="Section Title" />
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={() => moveSectionUp(si)} disabled={si === 0} title="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => moveSectionDown(si)} disabled={si === data.sections.length - 1} title="Move down">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => removeSection(si)} title="Remove section">
                    <Trash2 className="text-red-500" />
                  </Button>
                </div>
              </div>

              {s.bulletPoints.map((bp, bi) => (
                <div key={bi} className="flex gap-2 items-center">
                  <Input className="bg-gray-50" value={bp.text} onChange={(e) => updateBullet(si, bi, e.target.value)} placeholder="Bullet point text" />
                  <Button variant="outline" size="icon" onClick={() => moveBulletUp(si, bi)} disabled={bi === 0} title="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => moveBulletDown(si, bi)} disabled={bi === s.bulletPoints.length - 1} title="Move down">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
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
          {data.faqData.length === 0 && <div className="text-sm text-gray-500">No FAQ items yet. Click “Add FAQ”.</div>}
          {data.faqData.map((f, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2">
              <Input className="bg-gray-50" placeholder="Question" value={f.question} onChange={(e) => updateFAQ(i, "question", e.target.value)} />
              <Input className="bg-gray-50" placeholder="Answer" value={f.answer} onChange={(e) => updateFAQ(i, "answer", e.target.value)} />
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
            <Input className="bg-gray-50" placeholder="01XXXXXXXX" value={data.contactNumber} onChange={(e) => setField("contactNumber", e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Working Hours</Label>
            <Input className="bg-gray-50" placeholder="10 AM - 10 PM (Daily)" value={data.workingHours} onChange={(e) => setField("workingHours", e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Footer Text</Label>
            <Input className="bg-gray-50" placeholder="© Your Company. All rights reserved." value={data.footerText} onChange={(e) => setField("footerText", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-12 mb-8 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-md"
      >
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </motion.div>
  );
};

export default LandingPageEditor;
