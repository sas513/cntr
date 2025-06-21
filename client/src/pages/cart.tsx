import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import type { CartItem, Product } from "@shared/schema";

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export default function Cart() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: ""
  });
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sessionId = localStorage.getItem("sessionId") || 
    (() => {
      const newId = Math.random().toString(36).substring(7);
      localStorage.setItem("sessionId", newId);
      return newId;
    })();

  const { data: serverCartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: [`/api/cart/${sessionId}`],
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart/${sessionId}`] });
    },
  });

  const removeCartMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cart/${sessionId}`] });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderItems = serverCartItems.map(item => ({
        productId: item.productId!,
        name: item.product.name,
        nameAr: item.product.nameAr,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0]
      }));

      const totalAmount = serverCartItems.reduce(
        (sum, item) => sum + (parseFloat(item.product.price) * item.quantity),
        0
      ).toString();

      await apiRequest("POST", "/api/orders", {
        sessionId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        shippingAddress: customerInfo.address,
        city: customerInfo.city,
        totalAmount,
        items: orderItems
      });
    },
    onSuccess: () => {
      clearCart();
      toast({
        title: "تم إنشاء الطلب بنجاح",
        description: "سنتواصل معك قريباً لتأكيد الطلب",
      });
      setCustomerInfo({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: ""
      });
      setIsCheckingOut(false);
      queryClient.invalidateQueries({ queryKey: [`/api/cart/${sessionId}`] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      });
    },
  });

  const totalAmount = serverCartItems.reduce(
    (sum, item) => sum + (parseFloat(item.product.price) * item.quantity),
    0
  );

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
    updateCartMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
    removeCartMutation.mutate(id);
    toast({
      title: "تم حذف المنتج",
      description: "تم حذف المنتج من سلة التسوق",
    });
  };

  const handleCheckout = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    createOrderMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-8 rounded w-1/4"></div>
            <div className="bg-muted h-32 rounded"></div>
            <div className="bg-muted h-32 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (serverCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4 arabic-text">سلة التسوق فارغة</h1>
            <p className="text-muted-foreground mb-8 arabic-text">
              لا توجد منتجات في سلة التسوق. اكتشف مجموعتنا الرائعة من المنتجات
            </p>
            <Link href="/products">
              <Button size="lg">
                تسوق الآن
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 arabic-text">سلة التسوق</h1>
        <div className="mobile-friendly-divider"></div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {serverCartItems.map((item) => (
              <div key={item.id} className="mobile-card">
                {/* Mobile Layout */}
                <div className="block md:hidden">
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={item.product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                      alt={item.product.nameAr}
                      className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base arabic-text truncate">{item.product.nameAr}</h3>
                      <p className="text-sm text-muted-foreground arabic-text mt-1 line-clamp-2">
                        {item.product.descriptionAr}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="mobile-friendly-divider my-3"></div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="mobile-button h-8 w-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-10 text-center font-medium bg-muted rounded-lg py-1 text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="mobile-button h-8 w-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                        <span className="text-sm text-muted-foreground mr-1">د.ع</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {parseFloat(item.product.price).toLocaleString()} د.ع للقطعة
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                      alt={item.product.nameAr}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 arabic-text">{item.product.nameAr}</h3>
                      <p className="text-sm text-muted-foreground arabic-text">
                        {item.product.descriptionAr}
                      </p>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-primary">
                          {parseFloat(item.product.price).toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground mr-1">د.ع</span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Total Price */}
                    <div className="text-left">
                      <div className="font-bold">
                        {(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                        <span className="text-sm text-muted-foreground mr-1">د.ع</span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="mobile-card lg:sticky lg:top-4">
              <div className="mb-4">
                <h2 className="text-xl font-bold arabic-text">ملخص الطلب</h2>
                <div className="mobile-friendly-divider"></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="arabic-text text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">{totalAmount.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="arabic-text text-muted-foreground">الشحن</span>
                  <span className="text-green-600 font-medium">مجاني</span>
                </div>
                <div className="mobile-friendly-divider"></div>
                <div className="flex justify-between items-center py-2">
                  <span className="arabic-text text-lg font-bold">المجموع الكلي</span>
                  <span className="text-xl font-bold text-primary">{totalAmount.toLocaleString()} د.ع</span>
                </div>
              </div>

              <div className="mt-6">
                {!isCheckingOut ? (
                  <Button 
                    className="w-full mobile-button bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" 
                    size="lg"
                    onClick={() => setIsCheckingOut(true)}
                  >
                    إتمام الطلب
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="mobile-friendly-divider"></div>
                    <h3 className="font-semibold arabic-text text-lg">معلومات التوصيل</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="arabic-text text-sm font-medium">الاسم الكامل *</Label>
                        <Input
                          id="name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="أدخل اسمك الكامل"
                          className="mobile-input mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone" className="arabic-text text-sm font-medium">رقم الهاتف *</Label>
                        <Input
                          id="phone"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="07xxxxxxxxx"
                          className="mobile-input mt-1"
                          dir="ltr"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="arabic-text text-sm font-medium">البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="example@email.com"
                          className="mobile-input mt-1"
                          dir="ltr"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="city" className="arabic-text text-sm font-medium">المحافظة *</Label>
                        <Input
                          id="city"
                          value={customerInfo.city}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="اختر المحافظة"
                          className="mobile-input mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="address" className="arabic-text text-sm font-medium">العنوان التفصيلي *</Label>
                        <Textarea
                          id="address"
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="أدخل العنوان التفصيلي للتوصيل"
                          rows={3}
                          className="mobile-input mt-1 resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCheckingOut(false)}
                        className="mobile-button flex-1 order-2 sm:order-1"
                      >
                        إلغاء
                      </Button>
                      <Button 
                        onClick={handleCheckout}
                        disabled={createOrderMutation.isPending}
                        className="mobile-button flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 order-1 sm:order-2"
                      >
                        {createOrderMutation.isPending ? "جاري الإرسال..." : "تأكيد الطلب"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
