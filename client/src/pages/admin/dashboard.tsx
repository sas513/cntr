import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin/sidebar";
import StatsCard from "@/components/admin/stats-card";
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
  ClipboardList
} from "lucide-react";
import { Link } from "wouter";
import type { CustomerActivity } from "@shared/schema";

interface Stats {
  totalSales: string;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export default function AdminDashboard() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/analytics/stats"],
  });

  const { data: recentActivity = [] } = useQuery<CustomerActivity[]>({
    queryKey: ["/api/analytics/activity"],
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "add_to_cart":
        return <ShoppingBag className="w-4 h-4 text-white" />;
      case "view_product":
        return <Eye className="w-4 h-4 text-white" />;
      case "place_order":
        return <Package className="w-4 h-4 text-white" />;
      default:
        return <Activity className="w-4 h-4 text-white" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "add_to_cart":
        return "bg-green-500";
      case "view_product":
        return "bg-blue-500";
      case "place_order":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getActivityText = (action: string) => {
    switch (action) {
      case "add_to_cart":
        return "أضاف منتج للسلة";
      case "view_product":
        return "شاهد منتج";
      case "place_order":
        return "أنشأ طلب جديد";
      default:
        return action;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar />
        
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold arabic-text">لوحة التحكم</h1>
                <p className="text-muted-foreground arabic-text">سنتر المستودع للساعات والعطور</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">مرحباً,</p>
                  <p className="font-semibold arabic-text">المدير العام</p>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                  alt="صورة المدير" 
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="إجمالي المبيعات"
              value={stats?.totalSales ? `${stats.totalSales} د.ع` : "0 د.ع"}
              change="+12%"
              changeType="positive"
              icon={<DollarSign className="w-6 h-6" />}
              gradient="from-blue-500 to-blue-600"
            />
            
            <StatsCard
              title="الطلبات الجديدة"
              value={stats?.totalOrders.toString() || "0"}
              change="+8%"
              changeType="positive"
              icon={<ShoppingBag className="w-6 h-6" />}
              gradient="from-green-500 to-green-600"
            />
            
            <StatsCard
              title="العملاء النشطين"
              value={stats?.totalCustomers.toString() || "0"}
              change="+23%"
              changeType="positive"
              icon={<Users className="w-6 h-6" />}
              gradient="from-purple-500 to-purple-600"
            />
            
            <StatsCard
              title="المنتجات"
              value={stats?.totalProducts.toString() || "0"}
              change="+15"
              changeType="positive"
              icon={<Package className="w-6 h-6" />}
              gradient="from-orange-500 to-orange-600"
            />
          </div>

          {/* Charts and Analytics */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">تحليل المبيعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                    <p className="arabic-text">رسم بياني للمبيعات الشهرية</p>
                    <p className="text-sm arabic-text">سيتم تطوير الرسوم البيانية قريباً</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="arabic-text">نشاط العملاء المباشر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-8 h-8 mx-auto mb-2" />
                      <p className="arabic-text">لا توجد أنشطة حديثة</p>
                    </div>
                  ) : (
                    recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className={`w-10 h-10 ${getActivityColor(activity.action)} rounded-full flex items-center justify-center`}>
                          {getActivityIcon(activity.action)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium arabic-text">جلسة: {activity.sessionId.slice(0, 8)}...</p>
                          <p className="text-sm text-muted-foreground arabic-text">{getActivityText(activity.action)}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString('ar-EG') : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="arabic-text">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Link href="/admin/products">
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-3 w-full hover:bg-primary/5 hover:border-primary"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="font-medium arabic-text">إضافة منتج</span>
                  </Button>
                </Link>
                
                <Link href="/admin/settings">
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-3 w-full hover:bg-primary/5 hover:border-primary"
                  >
                    <Palette className="w-6 h-6" />
                    <span className="font-medium arabic-text">تخصيص المتجر</span>
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-3 w-full hover:bg-primary/5 hover:border-primary"
                >
                  <PieChart className="w-6 h-6" />
                  <span className="font-medium arabic-text">التقارير</span>
                </Button>
                
                <Link href="/admin/orders">
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col gap-3 w-full hover:bg-primary/5 hover:border-primary"
                  >
                    <ClipboardList className="w-6 h-6" />
                    <span className="font-medium arabic-text">إدارة الطلبات</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
