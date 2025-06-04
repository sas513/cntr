import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./hooks/use-cart";
import ThemeProvider from "@/components/theme-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import FloatingCartButton from "@/components/floating-cart-button";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/about" component={About} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/return-policy" component={ReturnPolicy} />
      <Route path="/shipping-policy" component={ShippingPolicy} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/reports" component={AdminReports} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <CartProvider>
            <div className="min-h-screen bg-background text-foreground" dir="rtl">
              <Header />
              <main>
                <Router />
              </main>
              <Footer />
              <FloatingCartButton />
              <Toaster />
            </div>
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
