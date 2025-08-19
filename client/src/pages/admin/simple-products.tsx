import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminSidebar from "@/components/admin/sidebar";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import type { Product, Category } from "@shared/schema";

export default function SimpleAdminProducts() {
  const { isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const [formData, setFormData] = useState({
    nameAr: "",
    name: "",
    price: "",
    categoryId: "",
    images: "",
    stock: "10",
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const cleanedData = {
        ...productData,
        price: productData.price.toString(),
        categoryId: parseInt(productData.categoryId),
        stock: parseInt(productData.stock),
        images: productData.images ? [productData.images] : [],
        tags: []
      };
      
      await apiRequest("POST", "/api/products", cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setFormData({
        nameAr: "",
        name: "",
        price: "",
        categoryId: "",
        images: "",
        stock: "10",
        isActive: true
      });
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المنتج بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إضافة المنتج",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProductMutation.mutate(formData);
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold arabic-text">إدارة المنتجات</h1>
              <p className="text-muted-foreground arabic-text">إضافة منتجات جديدة</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* نموذج إضافة منتج */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">إضافة منتج جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nameAr" className="arabic-text">اسم المنتج بالعربية</Label>
                    <Input
                      id="nameAr"
                      value={formData.nameAr}
                      onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                      placeholder="مثال: ساعة رولكس فاخرة"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">اسم المنتج بالإنجليزية</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Example: Luxury Rolex Watch"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="arabic-text">السعر (دينار عراقي)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="750000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoryId" className="arabic-text">الفئة</Label>
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="images" className="arabic-text">رابط الصورة</Label>
                    <Input
                      id="images"
                      value={formData.images}
                      onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock" className="arabic-text">الكمية</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="10"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createProductMutation.isPending}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    {createProductMutation.isPending ? "جاري الإضافة..." : "إضافة المنتج"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* قائمة المنتجات */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">المنتجات الحالية ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">جاري التحميل...</div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground arabic-text">
                    لا توجد منتجات حتى الآن
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 10).map((product) => (
                      <div key={product.id} className="border rounded p-3">
                        <div className="font-medium arabic-text">{product.nameAr}</div>
                        <div className="text-sm text-muted-foreground">
                          {parseInt(product.price).toLocaleString()} د.ع
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}