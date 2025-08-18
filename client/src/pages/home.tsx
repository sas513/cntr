import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import { Gem, Clock, Truck, Shield, Headphones, RotateCcw, Star } from "lucide-react";
import { Link } from "wouter";
import type { Product, Category, StoreSetting } from "@shared/schema";
import heroImagePath from "@assets/unico_h_hero_1_1755545621968.png";

export default function Home() {
  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products?featured=true"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: settings = [] } = useQuery<StoreSetting[]>({
    queryKey: ["/api/settings"],
  });

  const getSetting = (key: string) => 
    settings.find(s => s.key === key)?.value || "";

  const watchesCategory = categories.find(cat => cat.slug === "watches");
  const perfumesCategory = categories.find(cat => cat.slug === "perfumes");
  
  const heroTitle = getSetting("homepage_hero_title") || "أفخر تشكيلة من الساعات والعطور";
  const heroSubtitle = getSetting("homepage_hero_subtitle") || "اكتشف مجموعتنا الحصرية من أرقى الساعات والعطور العالمية بأفضل الأسعار";
  const heroImage = getSetting("hero_image") || heroImagePath;
  const freeShippingThreshold = getSetting("free_shipping_threshold");
  const deliveryTime = getSetting("delivery_time") || "1-3 أيام عمل";
  const warrantyPeriod = getSetting("warranty_period") || "12";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{
            backgroundImage: `url("${heroImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            opacity: 0.8
          }}
          onError={(e) => {
            console.log('Hero image failed to load:', heroImage);
            e.currentTarget.style.backgroundImage = `url("${heroImagePath}")`;
          }}
        ></div>
        
        <div className="relative container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20">
          <div className="max-w-2xl animate-fade-in text-center sm:text-right">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight arabic-text">
              {heroTitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 arabic-text">
              {heroSubtitle}
            </p>
            <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row justify-center sm:justify-start">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-primary font-medium">
                  تسوق الآن
                </Button>
              </Link>
              <Link href="/offers">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-[#111112] hover:bg-white hover:text-primary">
                  العروض الخاصة
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce-subtle opacity-20">
          <Gem className="w-16 h-16" />
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce-subtle opacity-20" style={{animationDelay: '1s'}}>
          <Clock className="w-12 h-12" />
        </div>
      </section>
      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center group">
              <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 arabic-text">شحن سريع</h3>
              <p className="text-xs sm:text-base text-muted-foreground arabic-text">
                {deliveryTime} {freeShippingThreshold && `- شحن مجاني فوق ${parseInt(freeShippingThreshold).toLocaleString()} د.ع`}
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 arabic-text">ضمان الجودة</h3>
              <p className="text-xs sm:text-base text-muted-foreground arabic-text">منتجات أصلية مع ضمان {warrantyPeriod} أشهر</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                <Headphones className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 arabic-text">دعم العملاء</h3>
              <p className="text-xs sm:text-base text-muted-foreground arabic-text">
                {getSetting("working_hours") || "خدمة عملاء متاحة على مدار الساعة"}
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 arabic-text">إرجاع مجاني</h3>
              <p className="text-xs sm:text-base text-muted-foreground arabic-text">
                إمكانية الإرجاع خلال {getSetting("return_period") || "7"} أيام
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Categories Section */}
      <section className="py-12 sm:py-16 bg-muted/50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 arabic-text">تسوق حسب الفئة</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground arabic-text">اختر من مجموعتنا المتنوعة</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Watches Category */}
            <Link href={`/products?category=${watchesCategory?.id}`}>
              <div className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src={getSetting("watches_category_image") || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
                  alt="مجموعة الساعات الفاخرة" 
                  className="w-full h-60 sm:h-72 md:h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 right-6 text-white">
                  <h3 className="text-3xl font-bold mb-2 arabic-text">الساعات</h3>
                  <p className="text-lg opacity-90 arabic-text">أحدث التصاميم العالمية</p>
                  <Button className="mt-4 bg-secondary hover:bg-secondary/90 text-primary">
                    تسوق الآن
                  </Button>
                </div>
              </div>
            </Link>
            
            {/* Perfumes Category */}
            <Link href={`/products?category=${perfumesCategory?.id}`}>
              <div className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src={getSetting("perfumes_category_image") || "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
                  alt="مجموعة العطور الفاخرة" 
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 right-6 text-white">
                  <h3 className="text-3xl font-bold mb-2 arabic-text">العطور</h3>
                  <p className="text-lg opacity-90 arabic-text">أرقى العطور العالمية</p>
                  <Button className="mt-4 bg-secondary hover:bg-secondary/90 text-primary">
                    تسوق الآن
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
      {/* Featured Products */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 arabic-text">المنتجات المميزة</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground arabic-text">اختيارات منسقة خصيصاً لك</p>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted h-48 sm:h-56 md:h-64 rounded-lg mb-3 sm:mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-muted h-3 sm:h-4 rounded w-3/4"></div>
                    <div className="bg-muted h-3 sm:h-4 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-8 sm:mt-12">
            <Link href="/products">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-primary font-medium text-sm sm:text-base">
                عرض جميع المنتجات
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="py-16 text-white bg-[#070708]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-bold arabic-text text-[31px] mt-[8px] mb-[8px] ml-[0px] mr-[0px] pt-[8px] pb-[8px]">آراء عملائنا</h2>
            <p className="text-xl opacity-90 arabic-text">تجارب حقيقية من عملائنا الكرام</p>
          </div>
          
          {/* Hero Testimonial */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-white/15 backdrop-blur-lg border-white/30 transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center text-yellow-400 text-2xl mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-current" />
                  ))}
                </div>
                <p className="text-2xl mb-8 opacity-95 arabic-text font-medium leading-relaxed text-[#dfe4ed]">
                  "منتجات عالية الجودة وخدمة عملاء ممتازة. أنصح بشدة بالتسوق من هنا"
                </p>
                <div className="flex items-center justify-center gap-4 text-[#dfe5f0]">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                    <span>أ</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold arabic-text">أحمد محمد</h4>
                    <p className="opacity-75 arabic-text">بغداد</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Testimonials */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "فاطمة علي",
                location: "البصرة",
                content: "تجربة تسوق رائعة، المنتجات أصلية والتوصيل سريع جداً"
              },
              {
                name: "خالد حسن",
                location: "أربيل", 
                content: "أسعار منافسة وجودة ممتازة، سأكون عميل دائم بإذن الله"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="rounded-lg border shadow-sm bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 text-[#f0f1f2]">
                <CardContent className="p-6 text-[#dfe3eb]">
                  <div className="flex justify-start text-yellow-400 text-lg mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-base mb-6 opacity-90 arabic-text leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                      <span>{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold arabic-text">{testimonial.name}</h4>
                      <p className="text-sm opacity-75 arabic-text">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-secondary to-accent text-white">
        <div className="container mx-auto px-4 text-center text-[#171616]">
          <h2 className="font-bold arabic-text text-[31px] mt-[8px] mb-[8px] ml-[0px] mr-[0px] pt-[8px] pb-[8px]">اشترك معنا الان </h2>
          <p className="text-xl mb-8 opacity-90 arabic-text">كن أول من يعلم بالمنتجات الجديدة والعروض الخاصة</p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="أدخل بريدك الإلكتروني" 
                className="flex-1 px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button className="bg-[#070708] hover:bg-primary/90 px-6 py-3">
                اشتراك
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
