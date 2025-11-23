"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Trash2, Plus, ArrowLeft, Save, LayoutGrid, Loader2, PlusCircle } from "lucide-react";

// Components
import FileUpload from "@/components/Fileupload";
import RichTextEditor from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// ===== Interfaces =====
interface IProductImage { url: string; fileId?: string; altText?: string; }
interface IVariantOption { value: string; price: number; stock: number; sku?: string; }
interface IVariant { name: string; options: IVariantOption[]; }
interface ISpecification { key: string; value: string; }
interface ICategory { _id: string; name: string; slug: string; }
interface IComboProduct { product: string; quantity: number; }

const EditProduct = ( {id }: { id: string }) => {

  const router = useRouter();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data States
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [images, setImages] = useState<IProductImage[]>([]);
  const [reviews, setReviews] = useState<IProductImage[]>([]);
  const [variants, setVariants] = useState<IVariant[]>([]);
  const [specifications, setSpecifications] = useState<ISpecification[]>([]);
  const [comboProducts, setComboProducts] = useState<IComboProduct[]>([]);
  
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    slug: "",
    description: "",
    price: "",
    originalPrice: "",
    costPrice: "", // Profit Logic
    stock: "",
    sku: "",
    categoryId: "",
    warranty: "",
    video: "",
    
    // Flags
    isFeatured: false,
    isActive: true,
    isCombo: false,
    isFreeDelivery: false,
    status: "ACTIVE",

    // Advanced / SEO
    rating: "0",
    seoTitle: "",
    seoDescription: "",
    sold: "0",
    popularityScore: "0",
    lastUpdatedIndex: "0",
    advanced: "100",
  });

  // Business Logic: Profit & Discount
  const priceNum = Number(formData.price) || 0;
  const originalPriceNum = Number(formData.originalPrice) || 0;
  const costPriceNum = Number(formData.costPrice) || 0;
  
  const discountPercent = originalPriceNum > priceNum 
    ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100) 
    : 0;
    
  const profit = priceNum - costPriceNum;
  const profitMargin = priceNum > 0 ? ((profit / priceNum) * 100).toFixed(1) : 0;

  // ===== Fetch Data =====
  useEffect(() => {
    const initData = async () => {
        try {
            // 1. Fetch Categories & Product Parallelly
            const [catRes, prodRes] = await Promise.all([
                fetch("/api/categories"),
                fetch(`/api/products/${id}`)
            ]);

            const catData = await catRes.json();
            const prodData = await prodRes.json();
            
            if (!prodRes.ok) throw new Error("Product fetch failed");
            
            setCategories(catData.categories || []);
            const p = prodData.product;

            // 2. Map Basic Data
            setFormData({
                name: p.name || "",
                shortName: p.shortName || "",
                slug: p.slug || "",
                description: p.description || "",
                price: String(p.price || 0),
                originalPrice: String(p.originalPrice || 0),
                costPrice: String(p.costPrice || 0),
                stock: String(p.stock || 0),
                sku: p.sku || "",
                categoryId: p.category?._id || "",
                warranty: p.warranty || "",
                video: p.video || "",
                
                isFeatured: p.isFeatured ?? false,
                isActive: p.isActive ?? true,
                isCombo: p.isCombo ?? false,
                isFreeDelivery: p.isFreeDelivery ?? false,
                status: p.status || "ACTIVE",

                rating: String(p.rating || 0),
                seoTitle: p.seoTitle || "",
                seoDescription: p.seoDescription || "",
                sold: String(p.sold || 0),
                popularityScore: String(p.popularityScore || 0),
                lastUpdatedIndex: String(p.lastUpdatedIndex || 0),
                advanced: String(p.advanced || 100),
            });

            // 3. Map Complex Arrays
            setImages(p.images || []);
            setReviews(p.reviews || []);
            setSpecifications(p.specifications || []);
            setComboProducts(p.comboProducts || []);
            setTags(p.seoKeywords || []); 

            // Map Variants
            if (Array.isArray(p.variants)) {
                setVariants(p.variants.map((v: any) => ({
                    name: v.name,
                    options: Array.isArray(v.options) ? v.options.map((o: any) => ({
                        value: o.value,
                        price: o.price || 0,
                        stock: o.stock || 0,
                        sku: o.sku || ""
                    })) : []
                })));
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to load product data");
        } finally {
            setLoading(false);
        }
    };

    if (id) initData();
  }, [id]);

  // ===== Handlers =====

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (html: string) => {
    setFormData((prev) => ({ ...prev, description: html }));
  };

  const handleImagePick = async () => prompt("Please enter the image URL:");

  // --- Specifications Logic ---
  const handleSpecChange = (i: number, key: keyof ISpecification, value: string) => {
      setSpecifications(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], [key]: value };
          return updated;
      });
  };
  const addSpecification = () => setSpecifications([...specifications, { key: "", value: "" }]);
  const removeSpecification = (i: number) => setSpecifications(prev => prev.filter((_, index) => index !== i));

  // --- Combo Logic ---
  const handleComboChange = (i: number, field: keyof IComboProduct, value: string | number) => {
    setComboProducts(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], [field]: field === 'quantity' ? Number(value) : value };
        return updated;
    });
  };
  const addComboProduct = () => setComboProducts([...comboProducts, { product: "", quantity: 1 }]);
  const removeComboProduct = (i: number) => setComboProducts(prev => prev.filter((_, index) => index !== i));

  // --- Variants Logic ---
  const addVariant = () => setVariants([...variants, { name: "", options: [] }]);
  const removeVariant = (index: number) => setVariants(prev => prev.filter((_, i) => i !== index));

  const handleVariantChange = (i: number, key: keyof IVariant, value: string) => {
      setVariants(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], [key]: value };
          return updated;
      });
  };

  const addVariantOption = (vi: number) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[vi].options.push({ value: "", price: priceNum, stock: Number(formData.stock), sku: formData.sku });
      return updated;
    });
  };

  const updateVariantOption = (vi: number, oi: number, field: string, val: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[vi].options[oi] = { ...updated[vi].options[oi], [field]: val };
      return updated;
    });
  };

  const removeVariantOption = (vi: number, oi: number) => {
    setVariants((prev) => {
        const updated = [...prev];
        updated[vi].options = updated[vi].options.filter((_, i) => i !== oi);
        return updated;
    })
  }

  // --- Tags ---
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };
  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  // ===== Submit =====
  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("নাম, দাম এবং ক্যাটাগরি আবশ্যক!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        rating: Number(formData.rating),
        sold: Number(formData.sold),
        popularityScore: Number(formData.popularityScore),
        advanced: Number(formData.advanced),
        
        images,
        reviews,
        specifications: specifications.filter(s => s.key && s.value),
        category: { _id: formData.categoryId },
        seoKeywords: tags,
        tags: tags,
        comboProducts: formData.isCombo ? comboProducts.filter(cp => cp.product && cp.quantity > 0) : [],
        variants: variants.filter(v => v.name).map(v => ({
            name: v.name,
            options: v.options.filter(o => o.value)
        }))
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("✅ প্রোডাক্ট সফলভাবে আপডেট হয়েছে!");
      router.push("/admin/products");
      router.refresh(); 
    } catch (err: any) {
      toast.error(err.message || "আপডেট ব্যর্থ হয়েছে!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="w-full px-0 sm:px-4 md:px-6 pb-20" // Responsive Wrapper
    >
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b mb-6 px-4 py-3 -mx-4 sm:mx-0 sm:px-0 sm:rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="w-5 h-5"/></Button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 hidden sm:block">এডিট: {formData.name}</h1>
            <h1 className="text-lg font-bold text-gray-800 sm:hidden">Edit Product</h1>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/products')}>বাতিল</Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-primary min-w-[120px]">
                {saving ? "সেভ হচ্ছে..." : <span className="flex items-center gap-2"><Save className="w-4 h-4"/> আপডেট করুন</span>}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Basic Info */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader><CardTitle className="flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-gray-500"/> মৌলিক তথ্য</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              
              <div className="space-y-2">
                <Label>পণ্যের নাম <span className="text-red-500">*</span></Label>
                <Input name="name" value={formData.name} onChange={handleChange} className="text-lg h-12 font-medium" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>ছোট নাম (Short Name)</Label>
                    <Input name="shortName" value={formData.shortName} onChange={handleChange} className="bg-gray-50"/>
                </div>
                <div className="space-y-2">
                    <Label>স্লাগ (URL)</Label>
                    <Input name="slug" value={formData.slug} onChange={handleChange} />
                </div>
              </div>
              
              <div className="space-y-2">
                  <Label>ওয়ারেন্টি</Label>
                  <Input name="warranty" value={formData.warranty} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>বিবরণ</Label>
                 <RichTextEditor value={formData.description} onChange={handleDescriptionChange} onPickImage={handleImagePick} />
              </div>
            </CardContent>
          </Card>

          {/* 2. Media */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader><CardTitle>ছবি এবং ভিডিও</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <Label className="mb-2 block font-medium">প্রোডাক্ট গ্যালারি</Label>
                  <FileUpload initialImages={images.map(i => i.url)} onChange={(urls) => setImages(urls.map(u => ({ url: u })))} />
               </div>
               <div>
                  <Label className="mb-2 block font-medium">রিভিউ ছবি (ঐচ্ছিক)</Label>
                  <FileUpload initialImages={reviews.map(i => i.url)} onChange={(urls) => setReviews(urls.map(u => ({ url: u })))} />
               </div>
               <div className="pt-2">
                 <Label>ইউটিউব ভিডিও লিংক</Label>
                 <Input name="video" value={formData.video} onChange={handleChange} />
               </div>
            </CardContent>
          </Card>

          {/* 3. Variants */}
          <Card className="shadow-sm border-gray-200">
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>ভ্যারিয়েন্ট সেটিংস</CardTitle>
                <Button type="button" onClick={addVariant} size="sm" variant="outline"><PlusCircle className="w-4 h-4 mr-1"/> নতুন ভ্যারিয়েন্ট</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {variants.map((variant, vi) => (
                <div key={vi} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                   <div className="flex items-center gap-2 mb-3">
                        <Input value={variant.name} onChange={(e) => handleVariantChange(vi, "name", e.target.value)} placeholder="নাম (যেমন: Color)" className="font-semibold w-1/2" />
                        <Button variant="ghost" size="icon" onClick={() => removeVariant(vi)} className="text-red-500 hover:bg-red-50 ml-auto"><Trash2 className="w-4 h-4"/></Button>
                   </div>
                  
                  <div className="space-y-3">
                    {variant.options.map((opt, oi) => (
                      <div key={oi} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                        <Input value={opt.value} onChange={(e) => updateVariantOption(vi, oi, 'value', e.target.value)} className="w-full md:w-auto md:flex-1" placeholder="মান (Red)" />
                        <Input type="number" value={opt.price} onChange={(e) => updateVariantOption(vi, oi, 'price', e.target.value)} className="w-24" placeholder="Price" />
                        <Input type="number" value={opt.stock} onChange={(e) => updateVariantOption(vi, oi, 'stock', e.target.value)} className="w-20" placeholder="Stock" />
                        <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removeVariantOption(vi, oi)}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addVariantOption(vi)} className="mt-2 text-xs border-dashed">
                        <Plus className="w-3 h-3 mr-1"/> অপশন যোগ করুন
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 4. Specifications (Added Back) */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>স্পেসিফিকেশন</CardTitle>
              <Button type="button" onClick={addSpecification} size="sm" variant="ghost"><PlusCircle className="w-4 h-4 mr-1" /> যোগ করুন</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {specifications.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input value={s.key} onChange={(e) => handleSpecChange(i, "key", e.target.value)} placeholder="Key (e.g. Dimensions)" />
                  <Input value={s.value} onChange={(e) => handleSpecChange(i, "value", e.target.value)} placeholder="Value (e.g. 10x20cm)" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSpecification(i)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (Settings) */}
        <div className="space-y-6">
          
          {/* Status & Toggles */}
          <Card className="shadow-sm border-gray-200">
             <CardHeader><CardTitle>স্ট্যাটাস ও টগল</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                    <Label htmlFor="active-switch">Active Status</Label>
                    <Switch id="active-switch" checked={formData.isActive} onCheckedChange={(c) => setFormData(p => ({...p, isActive: c}))} />
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                    <Label htmlFor="feat-switch">Featured Product</Label>
                    <Switch id="feat-switch" checked={formData.isFeatured} onCheckedChange={(c) => setFormData(p => ({...p, isFeatured: c}))} />
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                    <Label htmlFor="free-del">Free Delivery</Label>
                    <Switch id="free-del" checked={formData.isFreeDelivery} onCheckedChange={(c) => setFormData(p => ({...p, isFreeDelivery: c}))} />
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                    <Label htmlFor="combo-sw">Combo Product</Label>
                    <Switch id="combo-sw" checked={formData.isCombo} onCheckedChange={(c) => setFormData(p => ({...p, isCombo: c}))} />
                </div>
                
                {/* Category Select */}
                <div className="pt-2">
                   <Label className="mb-2 block font-medium">ক্যাটাগরি</Label>
                   <Select onValueChange={(v) => setFormData(p => ({...p, categoryId: v}))} value={formData.categoryId}>
                      <SelectTrigger><SelectValue placeholder="সিলেক্ট করুন..." /></SelectTrigger>
                      <SelectContent>
                          {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
             </CardContent>
          </Card>

          {/* Combo Logic (Conditional) */}
          {formData.isCombo && (
            <Card className="border-purple-200 bg-purple-50">
                <CardHeader><CardTitle className="text-purple-800">কম্বো আইটেম</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {comboProducts.map((cp, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <Input value={cp.product} onChange={(e) => handleComboChange(i, "product", e.target.value)} placeholder="Product ID" className="flex-1 bg-white" />
                            <Input type="number" value={cp.quantity} onChange={(e) => handleComboChange(i, "quantity", e.target.value)} placeholder="Qty" className="w-16 bg-white" />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeComboProduct(i)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" onClick={addComboProduct} size="sm" variant="outline" className="w-full bg-white"><PlusCircle className="w-4 h-4 mr-1" /> প্রোডাক্ট যোগ করুন</Button>
                </CardContent>
            </Card>
          )}

          {/* Pricing & Profit */}
          <Card className="border-blue-100 bg-blue-50/20 shadow-none">
            <CardHeader><CardTitle className="text-blue-800">দাম এবং প্রফিট</CardTitle></CardHeader>
            <CardContent className="space-y-5">
               <div className="bg-white p-3 rounded-md border border-blue-100 shadow-sm">
                  <Label className="text-xs uppercase text-gray-500 font-bold">বিক্রয় মূল্য</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-bold">৳</span>
                    <Input name="price" type="number" className="pl-8 font-bold text-xl h-12 border-0 p-0 focus-visible:ring-0" value={formData.price} onChange={handleChange} />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">আসল দাম (MRP)</Label>
                    <Input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} className="mt-1" />
                    {discountPercent > 0 && <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700">{discountPercent}% OFF</Badge>}
                  </div>
                  <div>
                    <Label className="text-xs">কেনা দাম (Cost)</Label>
                    <Input name="costPrice" type="number" className="mt-1 border-orange-200" value={formData.costPrice} onChange={handleChange} />
                  </div>
               </div>

               {/* Profit Visualizer */}
               {priceNum > 0 && costPriceNum > 0 && (
                   <div className={`p-4 rounded-lg border text-sm ${profit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                      <div className="flex justify-between font-bold text-base">
                          <span className={profit >= 0 ? "text-green-800" : "text-red-800"}>{profit >= 0 ? "লাভ" : "লোকসান"}</span>
                          <span className={profit >= 0 ? "text-green-700" : "text-red-700"}>৳ {profit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className={`h-1.5 rounded-full ${profit >= 0 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${Math.min(Number(profitMargin), 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs mt-2 font-medium opacity-80">
                          <span>মার্জিন</span>
                          <span>{profitMargin}%</span>
                      </div>
                   </div>
               )}
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader><CardTitle>ইনভেন্টরি</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label>মোট স্টক</Label>
                        <Input name="stock" type="number" value={formData.stock} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>SKU</Label>
                        <Input name="sku" value={formData.sku} onChange={handleChange} />
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* SEO Tags */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader><CardTitle>এসইও (Keywords)</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div><Label>টাইটেল</Label><Input name="seoTitle" value={formData.seoTitle} onChange={handleChange} /></div>
                    <div><Label>বিবরণ</Label><Input name="seoDescription" value={formData.seoDescription} onChange={handleChange} /></div>
                    
                    <Label>ট্যাগস / কিওয়ার্ডস</Label>
                    <div className="flex flex-wrap gap-2 mb-3 min-h-[30px] border p-2 rounded-md bg-gray-50">
                        {tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1 hover:bg-gray-200">
                                {tag} <Trash2 className="w-3 h-3 cursor-pointer text-gray-500 hover:text-red-500" onClick={() => removeTag(tag)}/>
                            </Badge>
                        ))}
                        <Input 
                            placeholder="লিখুন এবং Enter চাপুন..." 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            className="border-none shadow-none focus-visible:ring-0 h-8 p-0 bg-transparent"
                        />
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* Advanced Tracking */}
          <Card className="shadow-sm border-gray-200">
              <CardHeader><CardTitle>অ্যাডভান্সড ডাটা</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                  <div><Label>Sold Count</Label><Input name="sold" type="number" value={formData.sold} onChange={handleChange} /></div>
                  <div><Label>Rating (0-5)</Label><Input name="rating" type="number" value={formData.rating} onChange={handleChange} /></div>
                  <div><Label>Popularity</Label><Input name="popularityScore" type="number" value={formData.popularityScore} onChange={handleChange} /></div>
                  <div><Label>Sorting Index</Label><Input name="advanced" type="number" value={formData.advanced} onChange={handleChange} /></div>
              </CardContent>
          </Card>

        </div>
      </div>
    </motion.div>
  );
};

export default EditProduct;