import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminSidebar from "@/components/admin/sidebar";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Palette, Check, Sparkles } from "lucide-react";
import type { StoreSetting } from "@shared/schema";

const themes = [
  {
    id: "saved",
    name: "الثيم الأساسي المحفوظ",
    nameEn: "Saved Custom Theme",
    description: "الثيم المخصص المحفوظ مع ألوانك المختارة",
    category: "محفوظ",
    colors: {
      primary: "hsl(220, 90%, 50%)",
      secondary: "hsl(220, 15%, 96%)",
      accent: "hsl(220, 15%, 88%)",
      background: "hsl(0, 0%, 100%)",
      foreground: "hsl(220, 15%, 15%)",
    },
    isSaved: true
  },
  {
    id: "royal-blue",
    name: "الأزرق الملكي",
    nameEn: "Royal Blue",
    description: "لون أزرق أنيق ومهني للمتاجر الفاخرة",
    category: "كلاسيكي",
    colors: {
      primary: "hsl(220, 90%, 50%)",
      secondary: "hsl(220, 15%, 96%)",
      accent: "hsl(220, 15%, 88%)",
      background: "hsl(0, 0%, 100%)",
      foreground: "hsl(220, 15%, 15%)",
    }
  },
  {
    id: "emerald-luxury",
    name: "الزمرد الفاخر",
    nameEn: "Emerald Luxury",
    description: "لون أخضر فاخر يناسب المنتجات الطبيعية",
    category: "فاخر",
    colors: {
      primary: "hsl(158, 85%, 45%)",
      secondary: "hsl(158, 15%, 96%)",
      accent: "hsl(158, 15%, 88%)",
      background: "hsl(0, 0%, 100%)",
      foreground: "hsl(158, 15%, 15%)",
    }
  },
  {
    id: "sunset-warmth",
    name: "دفء الغروب",
    nameEn: "Sunset Warmth",
    description: "ألوان برتقالية دافئة ومريحة للعين",
    category: "دافئ",
    colors: {
      primary: "hsl(24, 95%, 53%)",
      secondary: "hsl(24, 15%, 96%)",
      accent: "hsl(24, 15%, 88%)",
      background: "hsl(0, 0%, 100%)",
      foreground: "hsl(24, 15%, 15%)",
    }
  },
  {
    id: "midnight-elegance",
    name: "أناقة منتصف الليل",
    nameEn: "Midnight Elegance",
    description: "تصميم داكن أنيق للمتاجر المتميزة",
    category: "داكن",
    colors: {
      primary: "hsl(240, 85%, 65%)",
      secondary: "hsl(240, 15%, 8%)",
      accent: "hsl(240, 15%, 15%)",
      background: "hsl(240, 10%, 5%)",
      foreground: "hsl(240, 15%, 85%)",
    }
  },
  {
    id: "rose-gold",
    name: "الذهب الوردي",
    nameEn: "Rose Gold",
    description: "لون وردي ذهبي أنثوي وجذاب",
    category: "أنثوي",
    colors: {
      primary: "hsl(330, 85%, 65%)",
      secondary: "hsl(330, 15%, 96%)",
      accent: "hsl(330, 15%, 88%)",
      background: "hsl(0, 0%, 100%)",
      foreground: "hsl(330, 15%, 15%)",
    }
  },
  {
    id: "nature-green",
    name: "الأخضر الطبيعي",
    nameEn: "Nature Green",
    description: "لون أخضر طبيعي يناسب المنتجات البيئية",
    category: "طبيعي",
    colors: {
      primary: "hsl(120, 85%, 45%)",
      secondary: "hsl(120, 15%, 96%)",
      accent: "hsl(120, 15%, 88%)",
      background: "hsl(0, 0%, 100%)",
      foreground: "hsl(120, 15%, 15%)",
    }
  }
];

export default function ThemeGallery() {
  // Always call all hooks at the top level
  const { admin, isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [appliedTheme, setAppliedTheme] = useState<string | null>(null);

  const { data: settings = [] } = useQuery<StoreSetting[]>({
    queryKey: ["/api/settings"],
    enabled: isAuthenticated,
  });

  const applyThemeMutation = useMutation({
    mutationFn: async (theme: typeof themes[0]) => {
      const colorSettings = [
        { key: "primary_color", value: theme.colors.primary },
        { key: "secondary_color", value: theme.colors.secondary },
        { key: "accent_color", value: theme.colors.accent },
        { key: "background_color", value: theme.colors.background },
        { key: "foreground_color", value: theme.colors.foreground },
        { key: "current_theme_id", value: theme.id },
        { key: "current_theme_name", value: theme.name }
      ];

      for (const setting of colorSettings) {
        await apiRequest("POST", "/api/admin/settings", setting);
      }
      
      return theme;
    },
    onSuccess: (theme) => {
      setAppliedTheme(theme.id);
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      
      // Apply theme to document immediately
      const root = document.documentElement;
      root.style.setProperty('--primary', theme.colors.primary.replace('hsl(', '').replace(')', ''));
      root.style.setProperty('--secondary', theme.colors.secondary.replace('hsl(', '').replace(')', ''));
      root.style.setProperty('--accent', theme.colors.accent.replace('hsl(', '').replace(')', ''));
      root.style.setProperty('--background', theme.colors.background.replace('hsl(', '').replace(')', ''));
      root.style.setProperty('--foreground', theme.colors.foreground.replace('hsl(', '').replace(')', ''));
      
      toast({
        title: "تم تطبيق الثيم بنجاح",
        description: `تم تطبيق ثيم "${theme.name}" على الموقع`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تطبيق الثيم",
        description: "حدث خطأ أثناء تطبيق الثيم. حاول مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  // Early returns after all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600 arabic-text">جاري التحقق من الصلاحية...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentThemeId = settings.find(s => s.key === "current_theme_id")?.value || "royal-blue";

  const handleApplyTheme = (theme: typeof themes[0]) => {
    applyThemeMutation.mutate(theme);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <AdminSidebar />
      
      <main className="flex-1 mr-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 arabic-text flex items-center gap-2">
            <Palette className="w-6 h-6" />
            معرض الثيمات والألوان
          </h1>
          <p className="text-gray-600 arabic-text">اختر الثيم المناسب لموقعك من المجموعة المتنوعة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const isCurrentTheme = currentThemeId === theme.id;
            const isApplying = applyThemeMutation.isPending && appliedTheme === theme.id;
            
            return (
              <Card key={theme.id} className={`group hover:shadow-lg transition-all duration-300 ${isCurrentTheme ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg arabic-text">{theme.name}</CardTitle>
                    <div className="flex gap-2">
                      {theme.isSaved && (
                        <Badge variant="secondary" className="arabic-text">
                          <Sparkles className="w-3 h-3 ml-1" />
                          محفوظ
                        </Badge>
                      )}
                      {isCurrentTheme && (
                        <Badge className="arabic-text">
                          <Check className="w-3 h-3 ml-1" />
                          مُطبق
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 arabic-text">{theme.description}</p>
                  <Badge variant="outline" className="w-fit arabic-text">{theme.category}</Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* معاينة الألوان */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium arabic-text">معاينة الألوان:</p>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="space-y-1">
                        <div 
                          className="w-full h-8 rounded border-2 border-gray-200"
                          style={{ backgroundColor: theme.colors.primary }}
                        ></div>
                        <p className="text-xs text-center arabic-text">أساسي</p>
                      </div>
                      <div className="space-y-1">
                        <div 
                          className="w-full h-8 rounded border-2 border-gray-200"
                          style={{ backgroundColor: theme.colors.secondary }}
                        ></div>
                        <p className="text-xs text-center arabic-text">ثانوي</p>
                      </div>
                      <div className="space-y-1">
                        <div 
                          className="w-full h-8 rounded border-2 border-gray-200"
                          style={{ backgroundColor: theme.colors.accent }}
                        ></div>
                        <p className="text-xs text-center arabic-text">مميز</p>
                      </div>
                      <div className="space-y-1">
                        <div 
                          className="w-full h-8 rounded border-2 border-gray-200"
                          style={{ backgroundColor: theme.colors.background }}
                        ></div>
                        <p className="text-xs text-center arabic-text">خلفية</p>
                      </div>
                      <div className="space-y-1">
                        <div 
                          className="w-full h-8 rounded border-2 border-gray-200"
                          style={{ backgroundColor: theme.colors.foreground }}
                        ></div>
                        <p className="text-xs text-center arabic-text">نص</p>
                      </div>
                    </div>
                  </div>

                  {/* معاينة التصميم */}
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div 
                      className="p-3 rounded text-center text-white font-medium text-sm"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      زر أساسي
                    </div>
                    <div className="mt-2 p-2 rounded text-center text-sm" style={{ 
                      backgroundColor: theme.colors.secondary,
                      color: theme.colors.foreground 
                    }}>
                      محتوى الصفحة
                    </div>
                  </div>

                  <Button
                    onClick={() => handleApplyTheme(theme)}
                    disabled={isCurrentTheme || isApplying}
                    className="w-full arabic-text"
                    variant={isCurrentTheme ? "outline" : "default"}
                  >
                    {isApplying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        جاري التطبيق...
                      </>
                    ) : isCurrentTheme ? (
                      "الثيم المُطبق حالياً"
                    ) : (
                      "تطبيق الثيم"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 arabic-text mb-2">💡 نصائح للاستخدام:</h3>
          <ul className="text-sm text-blue-800 arabic-text space-y-1">
            <li>• يمكنك تطبيق أي ثيم وسيتم حفظه تلقائياً</li>
            <li>• الثيم المخصص المحفوظ يحتوي على آخر تخصيصاتك</li>
            <li>• يمكنك العودة لأي ثيم في أي وقت</li>
            <li>• التغييرات تظهر فوراً على الموقع</li>
          </ul>
        </div>
      </main>
    </div>
  );
}