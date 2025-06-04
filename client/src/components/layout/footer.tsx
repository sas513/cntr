import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Mail, Facebook, Instagram, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import type { StoreSetting } from "@shared/schema";

export default function Footer() {
  const { data: settings = [] } = useQuery<StoreSetting[]>({
    queryKey: ["/api/settings"],
  });

  const getSetting = (key: string) => 
    settings.find(s => s.key === key)?.value || "";

  const storeName = getSetting("store_name") || "سنتر المستودع";
  const phone1 = getSetting("store_phone1") || "07813961800";
  const phone2 = getSetting("store_phone2") || "07810125388";
  const address = getSetting("store_address") || "الرمادي المستودع قرب مول الستي سنتر";
  const email = getSetting("store_email") || "info@centermustaudaa.com";
  const facebookUrl = getSetting("facebook_url") || "";
  const instagramUrl = getSetting("instagram_url") || "";
  const whatsappNumber = getSetting("whatsapp_number") || phone1;

  return (
    <footer className="bg-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6 arabic-text">{storeName}</h3>
            <p className="text-gray-300 mb-4 arabic-text">
              {getSetting("footer_text") || "وجهتك الأولى للساعات والعطور الفاخرة في العراق"}
            </p>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="arabic-text">{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{phone1}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{phone2}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{email}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 arabic-text">روابط سريعة</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link href="/">
                  <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto font-normal arabic-text">
                    الرئيسية
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto font-normal arabic-text">
                    المنتجات
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/products?category=1">
                  <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto font-normal arabic-text">
                    الساعات
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/products?category=2">
                  <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto font-normal arabic-text">
                    العطور
                  </Button>
                </Link>
              </li>
              <li>
                <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto font-normal arabic-text">
                  العروض
                </Button>
              </li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-6 arabic-text">خدمة العملاء</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link href="/return-policy">
                  <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto font-normal arabic-text">
                    سياسة الإرجاع
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy">
                  <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto font-normal arabic-text">
                    الشحن والتوصيل
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto font-normal arabic-text">
                    من نحن
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto font-normal arabic-text">
                    سياسة الخصوصية
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions">
                  <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto font-normal arabic-text">
                    الشروط والأحكام
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Social Media & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 arabic-text">تابعنا</h4>
            <div className="flex gap-4 mb-6">
              {facebookUrl && (
                <a 
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="sm" 
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full p-0"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                </a>
              )}
              {instagramUrl && (
                <a 
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="sm" 
                    className="w-10 h-10 bg-pink-600 hover:bg-pink-700 rounded-full p-0"
                  >
                    <Instagram className="w-4 h-4" />
                  </Button>
                </a>
              )}
              <a 
                href={`https://wa.me/964${whatsappNumber.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="sm" 
                  className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full p-0"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </a>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-300 text-sm arabic-text">اشترك في النشرة الإخبارية</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-primary">
                  اشتراك
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-600 pt-8 text-center">
          <p className="text-gray-300 arabic-text">
            &copy; 2024 {storeName}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <a 
          href={`https://wa.me/964${phone1.replace(/^0/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110">
            <MessageCircle className="w-6 h-6" />
          </Button>
        </a>
      </div>
    </footer>
  );
}
