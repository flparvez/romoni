"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FileUpload from "@/components/Fileupload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import RichTextEditor from "@/components/RichTextEditor";

// ===== Interfaces =====
interface IProductImage {
  url: string;
  fileId?: string;
  altText?: string;
}

interface IVariantOption {
  value: string;
  price: number;
  stock: number;
  sku?: string;
}

interface IVariant {
  name: string;
  options: IVariantOption[];
}

interface ISpecification {
  key: string;
  value: string;
}

interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

// ===== Component Start =====
const CreateProduct = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [images, setImages] = useState<IProductImage[]>([]);
  const [reviews, setReviews] = useState<IProductImage[]>([]);
  const [specifications, setSpecifications] = useState<ISpecification[]>([]);
  const [variants, setVariants] = useState<IVariant[]>([
    { name: "Color", options: [] },
    { name: "Size", options: [] },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortName: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    sku: "",
    categoryId: "",

    warranty: "",
    video: "",
    isFeatured: false,
    isActive: true,
    tags: "",
    rating: 0,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    isCombo: false,

  });

  // ===== Fetch Categories =====
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", { next: { revalidate: 60 } });
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // ===== Handlers =====
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({ ...prev, [target.name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [target.name]: target.value }));
    }
  };

  const handleSwitchChange = (field: keyof typeof formData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleDescriptionChange = (html: string) => {
    setFormData((prev) => ({ ...prev, description: html }));
  };
  const handleImagePick = async () => prompt("Please enter the image URL:");

  // ===== Variants =====
  const handleVariantOptionChange = (vi: number, oi: number, key: keyof IVariantOption, value: string | number) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[vi].options[oi] = {
        ...updated[vi].options[oi],
        [key]: key === "price" || key === "stock" ? Number(value) : value,
      };
      return updated;
    });
  };

  const addVariantOption = (vi: number) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[vi].options.push({
        value: "",
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        sku: formData.sku || "",
      });
      return updated;
    });
  };

  const removeVariantOption = (vi: number, oi: number) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[vi].options = updated[vi].options.filter((_, i) => i !== oi);
      return updated;
    });
  };

  // ===== Specifications =====
  const handleSpecChange = (i: number, key: keyof ISpecification, value: string) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [key]: value };
      return updated;
    });
  };

  const addSpecification = () => setSpecifications([...specifications, { key: "", value: "" }]);

  // ===== Submit Handler =====
  const handleSubmit = async () => {
    const validSpecs = specifications.filter((s) => s.key && s.value);
    const selectedCategory = categories.find((c) => c._id === formData.categoryId);

    if (!formData.name || !formData.price || !selectedCategory || images.length === 0) {
      toast.error("দয়া করে সব প্রয়োজনীয় ঘর পূরণ করুন এবং অন্তত একটি ছবি আপলোড করুন।");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice || 0),
          stock: Number(formData.stock || 0),
          rating: Number(formData.rating || 0),
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          seoKeywords: formData.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          images,
          reviews,
          specifications: validSpecs,
          category: {
            _id: selectedCategory._id,
            name: selectedCategory.name,
            slug: selectedCategory.slug,
          },
          variants: variants.map((v) => ({
            name: v.name,
            options: v.options.filter((o) => o.value),
          })),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.error || "প্রোডাক্ট তৈরি ব্যর্থ হয়েছে!");
        return;
      }
      toast.success("✅ প্রোডাক্ট সফলভাবে তৈরি হয়েছে!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("কিছু ভুল হয়েছে!");
      setLoading(false);
    }
  };

  // ===== Animation =====
  const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">🛍️ নতুন প্রোডাক্ট তৈরি করুন</h1>

      {/* ✅ Basic Info */}
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">মৌলিক তথ্য</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>প্রোডাক্ট নাম*</Label><Input name="name" value={formData.name} onChange={handleChange} /></div>
          <div><Label>ছোট নাম</Label><Input name="shortName" value={formData.shortName} onChange={handleChange} /></div>
      
          <div><Label>ওয়ারেন্টি</Label><Input name="warranty" value={formData.warranty} onChange={handleChange} /></div>
          <div><Label>ভিডিও লিংক</Label><Input name="video" value={formData.video} onChange={handleChange} /></div>
          <div><Label>মূল্য*</Label><Input name="price" type="number" value={formData.price} onChange={handleChange} /></div>
          <div><Label>স্টক</Label><Input name="stock" type="number" value={formData.stock} onChange={handleChange} /></div>
          <div><Label>SKU</Label><Input name="sku" value={formData.sku} onChange={handleChange} /></div>
          
        </CardContent>
      </Card>

      {/* ✅ Category & Status */}
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">ক্যাটাগরি ও স্ট্যাটাস</h2></CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center">
          <Select onValueChange={(val) => setFormData((prev) => ({ ...prev, categoryId: val }))} value={formData.categoryId}>
            <SelectTrigger className="w-full md:w-1/2"><SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন*" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-6">
            {["isFeatured", "isActive", "isCombo"].map((field) => (
              <div key={field} className="flex items-center gap-2">
                <Switch
                  checked={formData[field as keyof typeof formData] as boolean}
                  onCheckedChange={(val) => handleSwitchChange(field as keyof typeof formData, val)}
                />
                <Label>{field}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ✅ Variants Section */}
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">ভ্যারিয়েন্টস</h2></CardHeader>
        <CardContent className="space-y-4">
          {variants.map((variant, vi) => (
            <div key={vi} className="border p-4 rounded-xl bg-gray-50 space-y-3">
              <Label className="font-medium">{variant.name}</Label>
              {variant.options.map((opt, oi) => (
                <div key={oi} className="flex flex-wrap md:flex-nowrap gap-2">
                  <Input placeholder={`${variant.name} নাম`} value={opt.value} onChange={(e) => handleVariantOptionChange(vi, oi, "value", e.target.value)} />
                  <Input type="number" placeholder="মূল্য" value={opt.price} onChange={(e) => handleVariantOptionChange(vi, oi, "price", e.target.value)} />
                  <Input type="number" placeholder="স্টক" value={opt.stock} onChange={(e) => handleVariantOptionChange(vi, oi, "stock", e.target.value)} />
                  <Input placeholder="SKU" value={opt.sku} onChange={(e) => handleVariantOptionChange(vi, oi, "sku", e.target.value)} />
                  <Button variant="ghost" size="icon" onClick={() => removeVariantOption(vi, oi)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {/* ✅ Only one button visible - adds one option per click */}
              <Button type="button" onClick={() => addVariantOption(vi)} size="sm" variant="outline">
                + নতুন {variant.name} যুক্ত করুন
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* ✅ বিবরণ */}
       <Card>
           <CardHeader><h2 className="text-xl font-semibold">বিবরণ</h2></CardHeader>
           <CardContent>
               <RichTextEditor value={formData.description} onChange={handleDescriptionChange} onPickImage={handleImagePick} />
           </CardContent>
       </Card>
      {/* ✅ Images */}
      <Card>
        <CardHeader><h2 className="text-xl font-semibold">প্রোডাক্ট ছবি</h2></CardHeader>
        <CardContent>
          <FileUpload
            initialImages={images.map((img) => img.url)}
            onChange={(urls: string[]) => setImages(urls.map((url) => ({ url })))}
          />
        </CardContent>
      </Card>

      {/* ✅ Reviews */}
      {/* <Card>
        <CardHeader><h2 className="text-xl font-semibold">রিভিউ ছবি</h2></CardHeader>
        <CardContent>
          <FileUpload
            initialImages={reviews.map((img) => img.url)}
            onChange={(urls: string[]) => setReviews(urls.map((url) => ({ url })))}
          />
        </CardContent>
      </Card> */}

      <Button onClick={handleSubmit} disabled={loading} className="w-full mt-6">
        {loading ? "সেভ হচ্ছে..." : "প্রোডাক্ট তৈরি করুন"}
      </Button>
    </motion.div>
  );
};

export default CreateProduct;
