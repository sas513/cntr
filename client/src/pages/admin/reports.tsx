import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AdminSidebar from "@/components/admin/sidebar";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react";
import type { Order, Product, CustomerActivity, StoreSetting } from "@shared/schema";

export default function AdminReports() {
  const { isLoading: authLoading, isAuthenticated } = useAdminAuth();

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return null;
  }
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: activity = [] } = useQuery<CustomerActivity[]>({
    queryKey: ["/api/analytics/activity"],
  });

  const { data: settings = [] } = useQuery<StoreSetting[]>({
    queryKey: ["/api/settings"],
  });

  const getSetting = (key: string) => 
    settings.find(s => s.key === key)?.value || "";

  // حساب الإحصائيات (استثناء الطلبات الملغية من المبيعات)
  const confirmedOrders = orders.filter(order => order.status !== 'cancelled');
  const totalSalesIQD = confirmedOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const exchangeRate = parseFloat(getSetting("usd_exchange_rate")) || 1500;
  const totalSalesUSD = totalSalesIQD / exchangeRate;
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const avgOrderValue = confirmedOrders.length > 0 ? totalSalesIQD / confirmedOrders.length : 0;

  // الطلبات الجديدة (آخر 24 ساعة)
  const newOrders = orders.filter(order => {
    if (!order.createdAt) return false;
    const orderDate = new Date(order.createdAt);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return orderDate >= yesterday;
  });

  // الطلبات حسب الحالة
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // المنتجات الأكثر مبيعاً
  const productSales = orders.flatMap(order => {
    try {
      return typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
    } catch {
      return [];
    }
  }).reduce((acc: any, item: any) => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      acc[product.nameAr] = (acc[product.nameAr] || 0) + item.quantity;
    }
    return acc;
  }, {});

  const topProducts = Object.entries(productSales)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  // المبيعات حسب الشهر (آخر 6 أشهر)
  const monthlySales = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthOrders = orders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === date.getMonth() && 
             orderDate.getFullYear() === date.getFullYear();
    });
    const sales = monthOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    return {
      month: date.toLocaleDateString('ar-IQ', { month: 'long' }),
      sales,
      orders: monthOrders.length
    };
  }).reverse();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      
      <div className="flex-1 p-4 sm:p-6 lg:p-8 mr-64">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 arabic-text">التقارير والإحصائيات</h1>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground arabic-text">تقارير مفصلة عن أداء المتجر والمبيعات</p>
              <div className="bg-primary/10 px-3 py-1 rounded-lg">
                <span className="text-sm text-primary font-medium arabic-text">
                  سعر الصرف: 1 USD = {exchangeRate.toLocaleString()} د.ع
                </span>
              </div>
            </div>
          </div>

          {/* الإحصائيات الرئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 arabic-text">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  إجمالي المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-700">
                    {totalSalesIQD.toLocaleString()} د.ع
                  </div>
                  <div className="text-sm text-green-600">
                    ${totalSalesUSD.toFixed(2)} USD
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 arabic-text">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  إجمالي الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-700">{totalOrders}</div>
                  <div className="text-sm text-blue-600 flex items-center gap-1">
                    <ArrowUpIcon className="w-3 h-3" />
                    {newOrders.length} طلب جديد اليوم
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 arabic-text">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  متوسط قيمة الطلب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-purple-700">
                    {avgOrderValue.toLocaleString()} د.ع
                  </div>
                  <div className="text-sm text-purple-600">
                    ${(avgOrderValue / exchangeRate).toFixed(2)} USD
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 arabic-text">
                  <Package className="w-4 h-4 text-orange-600" />
                  إجمالي المنتجات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-orange-700">{totalProducts}</div>
                  <div className="text-sm text-orange-600">منتج متاح</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الطلبات حسب الحالة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <PieChart className="w-5 h-5" />
                  الطلبات حسب الحالة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(ordersByStatus).map(([status, count]) => {
                  const percentage = totalOrders > 0 ? (count / totalOrders * 100).toFixed(1) : 0;
                  const statusColors = {
                    'pending': 'bg-yellow-500',
                    'confirmed': 'bg-blue-500',
                    'shipped': 'bg-purple-500',
                    'delivered': 'bg-green-500',
                    'cancelled': 'bg-red-500'
                  };
                  const statusNames = {
                    'pending': 'قيد الانتظار',
                    'confirmed': 'مؤكد',
                    'shipped': 'تم الشحن',
                    'delivered': 'تم التسليم',
                    'cancelled': 'ملغى'
                  };
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`}></div>
                        <span className="arabic-text">{statusNames[status as keyof typeof statusNames]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{count}</span>
                        <Badge variant="secondary">{percentage}%</Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* المنتجات الأكثر مبيعاً */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 arabic-text">
                  <BarChart3 className="w-5 h-5" />
                  المنتجات الأكثر مبيعاً
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topProducts.length > 0 ? topProducts.map(([product, quantity], index) => (
                  <div key={`${product}-${index}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="arabic-text font-medium">{product as string}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{quantity}</span>
                      <span className="text-sm text-muted-foreground">قطعة</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground arabic-text">
                    لا توجد مبيعات بعد
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* المبيعات الشهرية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 arabic-text">
                <Calendar className="w-5 h-5" />
                المبيعات الشهرية (آخر 6 أشهر)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlySales.map((month, index) => {
                  const maxSales = Math.max(...monthlySales.map(m => m.sales));
                  const percentage = maxSales > 0 ? (month.sales / maxSales * 100) : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="arabic-text font-medium">{month.month}</span>
                        <div className="flex items-center gap-4">
                          <span>{month.orders} طلب</span>
                          <span className="font-semibold">{month.sales.toLocaleString()} د.ع</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* النشاط الأخير */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 arabic-text">
                <Users className="w-5 h-5" />
                النشاط الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activity.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm arabic-text">
                        {item.action === 'view_product' && 'عرض منتج'}
                        {item.action === 'add_to_cart' && 'إضافة للسلة'}
                        {item.action === 'place_order' && 'إنشاء طلب'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString('ar-IQ') : 'غير محدد'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}