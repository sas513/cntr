import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Globe, 
  Lock,
  Smartphone,
  TrendingUp,
  Palette
} from "lucide-react";
import { loginSchema, type LoginData } from "@shared/schema";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/admin/login", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      localStorage.setItem("adminToken", data.token);
      window.location.href = "/admin";
    },
    onError: (error) => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "اسم المستخدم أو كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex">
      {/* Left Side - Features Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-12 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-700/20"></div>
        <div className="absolute inset-0 opacity-40 bg-repeat" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
        
        <div className="relative z-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold arabic-text mb-3 text-blue-100">سنتر المستودع</h1>
            <p className="text-lg arabic-text text-blue-200">للساعات والعطور</p>
          </div>

          <div className="space-y-5">
            <h2 className="text-xl font-semibold arabic-text text-blue-200 mb-4">خدماتنا</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-600/20 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-5 h-5 text-blue-200" />
                  <span className="font-medium arabic-text text-blue-100 text-sm">المنتجات</span>
                </div>
                <p className="text-xs text-blue-300 arabic-text">مجموعة متنوعة من الساعات والعطور</p>
              </div>

              <div className="bg-blue-600/20 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="w-5 h-5 text-blue-200" />
                  <span className="font-medium arabic-text text-blue-100 text-sm">الطلبات</span>
                </div>
                <p className="text-xs text-blue-300 arabic-text">خدمة توصيل سريعة وموثوقة</p>
              </div>

              <div className="bg-blue-600/20 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-blue-200" />
                  <span className="font-medium arabic-text text-blue-100 text-sm">الأسعار</span>
                </div>
                <p className="text-xs text-blue-300 arabic-text">أسعار منافسة وعروض مميزة</p>
              </div>

              <div className="bg-blue-600/20 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-blue-200" />
                  <span className="font-medium arabic-text text-blue-100 text-sm">خدمة العملاء</span>
                </div>
                <p className="text-xs text-blue-300 arabic-text">دعم متميز وخدمة عملاء راقية</p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-base font-medium arabic-text text-blue-200 mb-3">الميزات المتقدمة</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-200" />
                  <span className="arabic-text text-blue-100 text-sm">إشعارات Telegram التلقائية</span>
                  <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/50 text-xs">متاح</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-200" />
                  <span className="arabic-text text-blue-100 text-sm">تتبع الزوار بالدول</span>
                  <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/50 text-xs">فعال</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-200" />
                  <span className="arabic-text text-blue-100 text-sm">نظام حماية متعدد الطبقات</span>
                  <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/50 text-xs">آمن</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-200" />
                  <span className="arabic-text text-blue-100 text-sm">تصميم متجاوب للجوال</span>
                  <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/50 text-xs">محسن</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-200" />
                  <span className="arabic-text text-blue-100 text-sm">تخصيص الألوان والصور</span>
                  <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/50 text-xs">ديناميكي</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-200" />
                  <span className="arabic-text text-blue-100 text-sm">تحليلات الأداء المتقدمة</span>
                  <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/50 text-xs">شامل</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 bg-blue-900/20 backdrop-blur-sm">
        <Card className="w-full max-w-md bg-blue-500/20 backdrop-blur-md border-blue-400/30 shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold arabic-text text-white">تسجيل دخول الإدارة</CardTitle>
              <p className="text-blue-200 arabic-text mt-1 text-sm">
                ادخل بيانات الإدارة للوصول إلى لوحة التحكم
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="arabic-text text-blue-100 font-medium text-sm">اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="ادخل اسم المستخدم"
                          disabled={loginMutation.isPending}
                          className="arabic-text bg-blue-500/20 border-blue-400/30 text-white placeholder:text-blue-300 focus:bg-blue-500/30 focus:border-blue-300 transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="arabic-text text-blue-100 font-medium text-sm">كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="ادخل كلمة المرور"
                            disabled={loginMutation.isPending}
                            className="arabic-text bg-blue-500/20 border-blue-400/30 text-white placeholder:text-blue-300 focus:bg-blue-500/30 focus:border-blue-300 transition-all pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      جاري تسجيل الدخول...
                    </div>
                  ) : (
                    "تسجيل الدخول"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-xs text-blue-200 arabic-text">
                خاص بإدارة المتجر فقط - نظام محمي بالكامل
              </p>
              <div className="flex justify-center mt-3 gap-2">
                <Badge className="bg-blue-400/30 text-blue-200 border-blue-400/50 text-xs">
                  آمن 100%
                </Badge>
                <Badge className="bg-blue-400/30 text-blue-200 border-blue-400/50 text-xs">
                  مشفر
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}