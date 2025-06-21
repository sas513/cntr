import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { Search, ShoppingCart, Heart, User, Menu, Phone, MapPin } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { StoreSetting } from "@shared/schema";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { cartItems } = useCart();

  const { data: settings = [] } = useQuery<StoreSetting[]>({
    queryKey: ["/api/settings"],
  });

  const getSetting = (key: string) => 
    settings.find(s => s.key === key)?.value || "";

  const storeName = getSetting("store_name") || "سنتر المستودع";
  const phone1 = getSetting("store_phone1") || "07813961800";
  const phone2 = getSetting("store_phone2") || "07810125388";
  const address = getSetting("store_address") || "الرمادي المستودع قرب مول الستي سنتر";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="border-b border-gray-200 py-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-secondary" />
                {phone1}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-secondary" />
                {phone2}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <MapPin className="w-4 h-4 text-secondary" />
              <span className="arabic-text">{address}</span>
            </div>
          </div>
        </div>
        
        {/* Main Navigation */}
        <nav className="py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary arabic-text hover:text-primary/80 transition-colors cursor-pointer">
                  {storeName}
                </h1>
              </Link>
              
              <div className="hidden md:flex items-center gap-6">
                <Link href="/">
                  <Button variant="ghost" className="text-foreground hover:text-primary font-medium arabic-text">
                    الرئيسية
                  </Button>
                </Link>
                <Link href="/products?category=1">
                  <Button variant="ghost" className="text-foreground hover:text-primary font-medium arabic-text">
                    الساعات
                  </Button>
                </Link>
                <Link href="/products?category=2">
                  <Button variant="ghost" className="text-foreground hover:text-primary font-medium arabic-text">
                    العطور
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="ghost" className="text-foreground hover:text-primary font-medium arabic-text">
                    جميع المنتجات
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <Input
                  type="text"
                  placeholder="ابحث عن المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 arabic-text"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </form>
              
              {/* Cart & User Actions */}
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="relative hover:bg-muted">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                  <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0">
                    0
                  </Badge>
                </Button>
                
                <Link href="/cart">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className={`relative hover:bg-primary/10 transition-all duration-200 ${
                      totalItems > 0 ? 'bg-primary/5 border border-primary/20' : ''
                    }`}
                  >
                    <ShoppingCart className={`w-7 h-7 ${totalItems > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                    {totalItems > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-accent text-white text-sm font-bold rounded-full h-7 w-7 flex items-center justify-center p-0 shadow-lg animate-pulse">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="md:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="arabic-text">{storeName}</SheetTitle>
                    </SheetHeader>
                    
                    <div className="mt-6 space-y-4">
                      {/* Mobile Search */}
                      <form onSubmit={handleSearch} className="relative">
                        <Input
                          type="text"
                          placeholder="ابحث عن المنتجات..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 arabic-text"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      </form>
                      
                      {/* Mobile Navigation Links */}
                      <nav className="flex flex-col space-y-2">
                        <Link href="/">
                          <Button variant="ghost" className="w-full justify-start arabic-text">
                            الرئيسية
                          </Button>
                        </Link>
                        <Link href="/products?category=1">
                          <Button variant="ghost" className="w-full justify-start arabic-text">
                            الساعات
                          </Button>
                        </Link>
                        <Link href="/products?category=2">
                          <Button variant="ghost" className="w-full justify-start arabic-text">
                            العطور
                          </Button>
                        </Link>
                        <Link href="/products">
                          <Button variant="ghost" className="w-full justify-start arabic-text">
                            جميع المنتجات
                          </Button>
                        </Link>
                        <div className="border-t pt-2 mt-2 space-y-2">
                          <Link href="/cart">
                            <Button 
                              variant="outline" 
                              className={`w-full justify-between arabic-text ${
                                totalItems > 0 ? 'border-primary text-primary bg-primary/5' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                السلة
                              </div>
                              {totalItems > 0 && (
                                <Badge className="bg-accent text-white">
                                  {totalItems}
                                </Badge>
                              )}
                            </Button>
                          </Link>

                        </div>
                      </nav>
                      
                      {/* Contact Info */}
                      <div className="pt-4 border-t space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-secondary" />
                          <span>{phone1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-secondary" />
                          <span>{phone2}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-secondary" />
                          <span className="arabic-text">{address}</span>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
