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
    <div className="fixed bottom-4 left-4 z-50 md:hidden">
      <Link href="/cart">
        <Button 
          size="lg"
          className="bg-accent hover:bg-accent/90 text-white shadow-2xl rounded-full w-16 h-16 p-0 relative animate-bounce"
          style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
        >
          <ShoppingCart className="w-8 h-8" />
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center p-0 shadow-lg">
            {totalItems}
          </Badge>
        </Button>
      </Link>
    </div>
  );
}