import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminSidebar from "@/components/admin/sidebar";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Plus } from "lucide-react";

export default function BasicAdminProducts() {
  const { isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const [nameAr, setNameAr] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !price) {
      setMessage("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nameAr: nameAr,
          name: nameAr,
          price: price,
          categoryId: 12, // Default to perfumes category
          stock: 10,
          images: [],
          tags: [],
          isActive: true,
          isFeatured: false
        })
      });

      if (response.ok) {
        setMessage("تم إضافة المنتج بنجاح!");
        setNameAr("");
        setPrice("");
      } else {
        const errorData = await response.text();
        setMessage(`خطأ: ${errorData}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage("حدث خطأ في إضافة المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold arabic-text mb-8">إدارة المنتجات</h1>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold arabic-text mb-6">إضافة منتج جديد</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="arabic-text">اسم المنتج *</Label>
                  <Input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: عطر شانيل الأزرق"
                    required
                  />
                </div>

                <div>
                  <Label className="arabic-text">السعر (دينار عراقي) *</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="150000"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  {isSubmitting ? "جاري الإضافة..." : "إضافة المنتج"}
                </Button>
              </form>

              {message && (
                <div className={`mt-4 p-3 rounded ${
                  message.includes("نجاح") 
                    ? "bg-green-100 text-green-800 border border-green-300" 
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}