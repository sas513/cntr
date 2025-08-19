import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import { default as ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/hooks/use-cart";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import FloatingCartButton from "@/components/floating-cart-button";
import { useVisitorTracking } from "./hooks/use-visitor-tracking";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Offers from "@/pages/offers";
import About from "@/pages/about";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsConditions from "@/pages/terms-conditions";
import ReturnPolicy from "@/pages/return-policy";
import ShippingPolicy from "@/pages/shipping-policy";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import AdminSettings from "@/pages/admin/settings";
import AdminReports from "@/pages/admin/reports";
import ThemeGallery from "@/pages/admin/theme-gallery";
import NotFound from "@/pages/not-found";
import { useLocation } from "wouter";

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');
  
  // Track visitors only for customer pages
  if (!isAdminRoute) {
    useVisitorTracking();
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <CartProvider>
            <div className="min-h-screen bg-background text-foreground" dir="rtl">
              {isAdminRoute ? (
                // Admin Layout - No Header/Footer
                <Switch>
                  <Route path="/admin/login" component={AdminLogin} />
                  <Route path="/admin/products" component={AdminProducts} />
                  <Route path="/admin/orders" component={AdminOrders} />
                  <Route path="/admin/customers" component={AdminCustomers} />
                  <Route path="/admin/theme-gallery" component={ThemeGallery} />
                  <Route path="/admin/settings" component={AdminSettings} />
                  <Route path="/admin/reports" component={AdminReports} />
                  <Route path="/admin" component={AdminDashboard} />
                </Switch>
              ) : (
                // Customer Layout - With Header/Footer
                <>
                  <Header />
                  <main>
                    <Switch>
                      <Route path="/" component={Home} />
                      <Route path="/products" component={Products} />
                      <Route path="/product/:id" component={ProductDetail} />
                      <Route path="/cart" component={Cart} />
                      <Route path="/offers" component={Offers} />
                      <Route path="/about" component={About} />
                      <Route path="/privacy-policy" component={PrivacyPolicy} />
                      <Route path="/terms-conditions" component={TermsConditions} />
                      <Route path="/return-policy" component={ReturnPolicy} />
                      <Route path="/shipping-policy" component={ShippingPolicy} />
                      <Route component={NotFound} />
                    </Switch>
                  </main>
                  <Footer />
                  <FloatingCartButton />
                </>
              )}
              <Toaster />
            </div>
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;