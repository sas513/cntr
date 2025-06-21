import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart } from "lucide-react";
import { Link } from "wouter";

export default function FloatingCartButton() {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <div className="mobile-cart-button">
      <Link href="/cart">
        <Button 
          size="lg"
          className="w-14 h-14 p-0 relative bg-transparent border-0 hover:bg-transparent"
        >
          <ShoppingCart className="w-6 h-6 text-white" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center p-0 shadow-lg border-2 border-white transition-all">
            {totalItems}
          </Badge>
        </Button>
      </Link>
    </div>
  );
}