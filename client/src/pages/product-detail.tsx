import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Star, Truck, Shield, RotateCcw, Plus, Minus, ArrowRight, Camera, ShoppingCart } from "lucide-react";
import type { Product } from "@shared/schema";
import ImagePreview from "@/components/ImagePreview";

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", { categoryId: product?.categoryId }],
    enabled: !!product?.categoryId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error("No product selected");
      
      const sessionId = localStorage.getItem("sessionId") || 
        (() => {
          const newId = Math.random().toString(36).substring(7);
          localStorage.setItem("sessionId", newId);
          return newId;
        })();

      await apiRequest("POST", "/api/cart", {
        sessionId,
        productId: product.id,
        quantity
      });

      // Log activity
      await apiRequest("POST", "/api/activity", {
        sessionId,
        action: "add_to_cart",
        productId: product.id,
        metadata: { quantity }
      });
    },
    onSuccess: () => {
      addToCart(product!, quantity);
      toast({
        title: "تم إضافة المنتج",
        description: "تم إضافة المنتج إلى سلة التسوق بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المنتج",
        variant: "destructive",
      });
    },
  });

  const logViewMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      
      const sessionId = localStorage.getItem("sessionId") || 
        (() => {
          const newId = Math.random().toString(36).substring(7);
          localStorage.setItem("sessionId", newId);
          return newId;
        })();

      await apiRequest("POST", "/api/activity", {
        sessionId,
        action: "view_product",
        productId: product.id,
        metadata: {}
      });
    },
  });

  // Log product view when product loads
  useState(() => {
    if (product) {
      logViewMutation.mutate();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="bg-muted h-8 rounded w-3/4"></div>
                <div className="bg-muted h-6 rounded w-1/2"></div>
                <div className="bg-muted h-4 rounded"></div>
                <div className="bg-muted h-10 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 arabic-text">المنتج غير موجود</h1>
          <Link href="/products">
            <Button>العودة للمنتجات</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredRelatedProducts = relatedProducts
    .filter(p => p.id !== product.id && p.isActive)
    .slice(0, 4);

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  // قائمة الصور - استخدام صورة افتراضية إذا لم توجد صور  
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"];

  const handleImagePreview = () => {
    setCurrentImageIndex(selectedImage);
    setShowImagePreview(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">الرئيسية</Link>
            <ArrowRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-primary">المنتجات</Link>
            <ArrowRight className="w-4 h-4" />
            <span className="text-foreground arabic-text">{product.nameAr}</span>
          </div>
        </nav>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Images */}
          <div>
            <div className="mb-4 relative group">
              <img
                src={productImages[selectedImage]}
                alt={product.nameAr}
                className="w-full h-96 object-cover rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                onClick={handleImagePreview}
              />
              
              {/* Camera Overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white backdrop-blur-sm"
                  onClick={handleImagePreview}
                >
                  <Camera className="w-4 h-4 ml-2" />
                  معاينة الصور
                </Button>
              </div>
            </div>
            
            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === index ? "border-primary shadow-lg" : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.nameAr} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              {hasDiscount && (
                <Badge className="bg-red-500 text-white mb-2">
                  خصم {discountPercentage}%
                </Badge>
              )}
              <h1 className="text-3xl font-bold mb-2 arabic-text">{product.nameAr}</h1>
              <p className="text-lg text-muted-foreground mb-4 arabic-text">{product.descriptionAr}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-muted-foreground">(127 تقييم)</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold text-primary">{parseFloat(product.price).toLocaleString()}</span>
                <span className="text-muted-foreground">د.ع</span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {parseFloat(product.originalPrice!).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">شامل ضريبة القيمة المضافة</p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock && product.stock > 0 ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  متوفر في المخزن ({product.stock} قطعة)
                </Badge>
              ) : (
                <Badge variant="destructive">نفدت الكمية</Badge>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 arabic-text">الكمية</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.stock || quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-8">
              <Button 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => addToCartMutation.mutate()}
                disabled={!product.stock || product.stock === 0 || addToCartMutation.isPending}
              >
                <ShoppingCart className="w-5 h-5 ml-2" />
                {addToCartMutation.isPending ? "جاري الإضافة..." : "أضف إلى السلة"}
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                <Heart className="w-5 h-5 ml-2" />
                أضف للمفضلة
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-primary" />
                <span className="arabic-text">شحن مجاني للطلبات أكثر من 500,000 د.ع</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span className="arabic-text">ضمان أصالة المنتج</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-5 h-5 text-primary" />
                <span className="arabic-text">إمكانية الإرجاع خلال 30 يوم</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {filteredRelatedProducts.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 arabic-text">منتجات ذات صلة</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="product-card overflow-hidden">
                  <div className="relative group">
                    <img
                      src={relatedProduct.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                      alt={relatedProduct.nameAr}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Link href={`/product/${relatedProduct.id}`}>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <Button 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all"
                        >
                          عرض التفاصيل
                        </Button>
                      </div>
                    </Link>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 arabic-text">{relatedProduct.nameAr}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        {parseFloat(relatedProduct.price).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">د.ع</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Image Preview Modal */}
      <ImagePreview
        images={productImages}
        currentIndex={currentImageIndex}
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        onIndexChange={setCurrentImageIndex}
      />
    </div>
  );
}
