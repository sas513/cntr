import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminSidebar from "@/components/admin/sidebar";
import StatsCard from "@/components/admin/stats-card";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  TrendingUp,
  Activity,
  Eye,
  Heart,
  Plus,
  Palette,
  PieChart,
  ClipboardList,
  Calendar,
  Globe,
  MapPin
} from "lucide-react";
import { Link } from "wouter";
import type { CustomerActivity, Order } from "@shared/schema";

interface Stats {
  totalSales: string;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export default function AdminDashboard() {
  // Always call all hooks at the top level
  const { admin, isLoading: authLoading, isAuthenticated } = useAdminAuth();
  
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/analytics/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentActivity = [] } = useQuery<CustomerActivity[]>({
    queryKey: ["/api/analytics/activity"],
    enabled: isAuthenticated,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
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

  // حساب الطلبات الجديدة (آخر 24 ساعة)
  const newOrders = orders.filter(order => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return orderDate >= yesterday;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <AdminSidebar />
      
      <main className="flex-1 mr-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 arabic-text">لوحة التحكم</h1>
          <p className="text-gray-600 arabic-text">مرحباً بك، {admin?.username}</p>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="إجمالي المبيعات"
            value={stats?.totalSales || "0 د.ع"}
            icon={DollarSign}
            change="+12%"
            changeLabel="من الشهر الماضي"
          />
          <StatsCard
            title="الطلبات"
            value={stats?.totalOrders?.toString() || "0"}
            icon={ShoppingBag}
            change="+8%"
            changeLabel="من الأسبوع الماضي"
          />
          <StatsCard
            title="العملاء"
            value={stats?.totalCustomers?.toString() || "0"}
            icon={Users}
            change="+15%"
            changeLabel="عملاء جدد"
          />
          <StatsCard
            title="المنتجات"
            value={stats?.totalProducts?.toString() || "0"}
            icon={Package}
            change="مستقر"
            changeLabel="في المخزون"
          />
        </div>

        {/* الإجراءات السريعة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="arabic-text flex items-center gap-2">
                <Activity className="w-5 h-5" />
                الإجراءات السريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/products/new">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Plus className="w-6 h-6" />
                    <span className="arabic-text text-sm">إضافة منتج</span>
                  </Button>
                </Link>
                
                <Link href="/admin/orders">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <ClipboardList className="w-6 h-6" />
                    <span className="arabic-text text-sm">عرض الطلبات</span>
                  </Button>
                </Link>
                
                <Link href="/admin/theme-gallery">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Palette className="w-6 h-6" />
                    <span className="arabic-text text-sm">تخصيص الموقع</span>
                  </Button>
                </Link>
                
                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <PieChart className="w-6 h-6" />
                    <span className="arabic-text text-sm">التقارير</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="arabic-text flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                الطلبات الجديدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{newOrders.length}</div>
                <p className="text-sm text-gray-600 arabic-text">طلبات جديدة اليوم</p>
                {newOrders.length > 0 && (
                  <Link href="/admin/orders">
                    <Button size="sm" className="mt-3 w-full">
                      عرض الطلبات
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* النشاط الأخير */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text flex items-center gap-2">
                <Eye className="w-5 h-5" />
                النشاط الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium arabic-text">{activity.description}</p>
                      <p className="text-sm text-gray-600">
                        {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString('ar-IQ') : ''}
                      </p>
                    </div>
                    <Badge variant="secondary" className="arabic-text">
                      {activity.type === 'view' ? 'مشاهدة' : 
                       activity.type === 'purchase' ? 'شراء' : 'نشاط'}
                    </Badge>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-gray-500 text-center py-4 arabic-text">لا يوجد نشاط حديث</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="arabic-text flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                آخر الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium arabic-text">طلب #{order.id}</p>
                      <p className="text-sm text-gray-600 arabic-text">{order.customerName}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-primary">{order.total} د.ع</p>
                      <Badge 
                        variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="arabic-text"
                      >
                        {order.status === 'pending' ? 'معلق' :
                         order.status === 'completed' ? 'مكتمل' :
                         order.status === 'cancelled' ? 'ملغي' : order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-gray-500 text-center py-4 arabic-text">لا توجد طلبات</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}