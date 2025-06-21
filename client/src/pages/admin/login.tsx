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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Left Side - Features Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-12 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0 opacity-40 bg-repeat" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
        
        <div className="relative z-10">
          {/* Main Title */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold arabic-text mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              سنتر المستودع
            </h1>
            <p className="text-xl arabic-text text-gray-300 mb-2">للساعات والعطور</p>
            <p className="text-lg arabic-text text-gray-400">لوحة التحكم الإدارية المتقدمة</p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold arabic-text text-blue-300 mb-6">الخدمات والميزات</h2>
              
              {/* Core Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-6 h-6 text-blue-400" />
                    <span className="font-medium arabic-text">إدارة المنتجات</span>
                  </div>
                  <p className="text-sm text-gray-300 arabic-text">إضافة وتعديل المنتجات والفئات</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart className="w-6 h-6 text-green-400" />
                    <span className="font-medium arabic-text">إدارة الطلبات</span>
                  </div>
                  <p className="text-sm text-gray-300 arabic-text">متابعة ومعالجة طلبات العملاء</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                    <span className="font-medium arabic-text">التقارير المالية</span>
                  </div>
                  <p className="text-sm text-gray-300 arabic-text">إحصائيات مفصلة ومتعددة العملات</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-yellow-400" />
                    <span className="font-medium arabic-text">إدارة العملاء</span>
                  </div>
                  <p className="text-sm text-gray-300 arabic-text">متابعة العملاء وسجل النشاطات</p>
                </div>
              </div>

              {/* Advanced Features */}
              <div className="mt-6">
                <h3 className="text-lg font-medium arabic-text text-purple-300 mb-4">الميزات المتقدمة</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span className="arabic-text">إشعارات Telegram التلقائية</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">متاح</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-green-400" />
                    <span className="arabic-text">تتبع الزوار بالدول</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">فعال</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <span className="arabic-text">نظام حماية متعدد الطبقات</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">آمن</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-pink-400" />
                    <span className="arabic-text">تصميم متجاوب للجوال</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">محسن</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-orange-400" />
                    <span className="arabic-text">تخصيص الألوان والصور</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">ديناميكي</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-red-400" />
                    <span className="arabic-text">تحليلات الأداء المتقدمة</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">شامل</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-white/5 backdrop-blur-sm">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold arabic-text text-white">تسجيل دخول الإدارة</CardTitle>
              <p className="text-gray-300 arabic-text mt-2">
                ادخل بيانات الإدارة للوصول إلى لوحة التحكم المتقدمة
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="arabic-text text-white font-medium">اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="ادخل اسم المستخدم"
                          disabled={loginMutation.isPending}
                          className="arabic-text bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 transition-all"
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
                      <FormLabel className="arabic-text text-white font-medium">كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="ادخل كلمة المرور"
                            disabled={loginMutation.isPending}
                            className="arabic-text bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 transition-all pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
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

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400 arabic-text">
                خاص بإدارة المتجر فقط - نظام محمي بالكامل
              </p>
              <div className="flex justify-center mt-4 gap-2">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  آمن 100%
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
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