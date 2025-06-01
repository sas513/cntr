import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings,
  Home,
  LogOut 
} from "lucide-react";
import { Link, useLocation } from "wouter";

const navigationItems = [
  {
    title: "نظرة عامة",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "المنتجات",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "الطلبات",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "العملاء",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "الإعدادات",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white border-l border-border h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <Link href="/">
          <h2 className="text-xl font-bold text-primary arabic-text mb-8">
            سنتر المستودع
          </h2>
        </Link>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/admin" && location?.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 arabic-text",
                    isActive 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-border space-y-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-3 arabic-text">
              <Home className="w-5 h-5" />
              عرض المتجر
            </Button>
          </Link>
          
          <Button variant="ghost" className="w-full justify-start gap-3 arabic-text text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
}
