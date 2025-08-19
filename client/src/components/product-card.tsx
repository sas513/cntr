import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Star, Eye } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const sessionId = localStorage.getItem("sessionId") || 
        (() => {
          const newId = Math.random().toString(36).substring(7);
          localStorage.setItem("sessionId", newId);
          return newId;
        })();

      await apiRequest("POST", "/api/cart", {
        sessionId,
        productId: product.id,
        quantity: 1
      });

      // Log activity
      await apiRequest("POST", "/api/activity", {
        sessionId,
        action: "add_to_cart",
        productId: product.id,
        metadata: { quantity: 1 }
      });
    },
    onSuccess: () => {
      addToCart(product, 1);
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

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  return (
    <div 
      className="mobile-card group cursor-pointer w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={product.images?.[0] || "/api/placeholder-image"}
          alt={product.nameAr}
          className="w-full h-44 sm:h-52 md:h-60 object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl cached-image"
          loading="eager"
          decoding="sync"
          style={{
            opacity: 1,
            background: 'transparent',
            transform: 'translateZ(0)',
            minHeight: 'auto'
          }}
          onError={(e) => {
            e.currentTarget.src = "/api/placeholder-image";
          }}
          onLoad={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 space-y-2">
          {hasDiscount && (
            <Badge className="bg-red-500 text-white rounded-lg text-xs">
              خصم {discountPercentage}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-blue-500 text-white rounded-lg text-xs">
              مميز
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="destructive" className="rounded-lg text-xs">
              نفدت الكمية
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className={`absolute top-3 left-3 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button size="sm" variant="secondary" className="rounded-xl p-2 bg-white/90 hover:bg-white backdrop-blur-sm">
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick View Overlay */}
        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity rounded-xl ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Link href={`/product/${product.id}`}>
            <Button 
              size="sm" 
              className="mobile-button bg-white text-primary hover:bg-gray-100 transform transition-all backdrop-blur-sm"
            >
              <Eye className="w-4 h-4 ml-2" />
              عرض سريع
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-base sm:text-lg font-semibold mb-2 arabic-text hover:text-primary transition-colors line-clamp-2">
            {product.nameAr}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 arabic-text line-clamp-2 hidden sm:block">
          {product.descriptionAr}
        </p>

        <div className="mobile-friendly-divider my-3"></div>

        {/* Rating - Hidden on mobile to save space */}
        <div className="hidden sm:flex items-center gap-2 mb-3">
          <div className="flex text-yellow-400 text-sm">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-muted-foreground text-sm">(127 تقييم)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
              {parseFloat(product.price).toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">د.ع</span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through ml-2">
                {parseFloat(product.originalPrice!).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="mb-3 sm:mb-4">
          {product.stock && product.stock > 0 ? (
            <span className="text-green-600 text-xs sm:text-sm arabic-text bg-green-50 px-2 py-1 rounded-lg">
              متوفر ({product.stock} قطعة)
            </span>
          ) : (
            <span className="text-red-600 text-xs sm:text-sm arabic-text bg-red-50 px-2 py-1 rounded-lg">نفدت الكمية</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full mobile-button bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs sm:text-sm py-2 sm:py-3"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCartMutation.mutate();
          }}
          disabled={!product.stock || product.stock === 0 || addToCartMutation.isPending}
        >
          {addToCartMutation.isPending ? "جاري الإضافة..." : "أضف إلى السلة"}
        </Button>
      </div>
    </div>
  );
}
