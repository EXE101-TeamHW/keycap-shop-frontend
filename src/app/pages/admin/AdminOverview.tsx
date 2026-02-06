import { DollarSign, Package, Users, TrendingUp, ShoppingCart, UserCog } from "lucide-react";
import { DashboardSidebar } from "../../components/ui/DashboardSidebar";
import { DashboardHeader } from "../../components/ui/DashboardHeader";
import { DashboardFooter } from "../../components/ui/DashboardFooter";

export function AdminOverview() {
  const stats = {
    totalRevenue: "$45,231",
    revenueGrowth: "+12.5%",
    totalOrders: 523,
    ordersGrowth: "+8.3%",
    totalCustomers: 1842,
    customersGrowth: "+15.2%",
    avgOrderValue: "$86.50",
    avgGrowth: "+5.7%"
  };

  const recentActivities = [
    {
      id: 1,
      type: "order",
      icon: Package,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "New order placed",
      description: "Order #ORD-523 - $129.99",
      time: "2 minutes ago"
    },
    {
      id: 2,
      type: "user",
      icon: UserCog,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "New user registered",
      description: "sarah.wilson@example.com",
      time: "15 minutes ago"
    },
    {
      id: 3,
      type: "product",
      icon: Package,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Product stock updated",
      description: "Neon Dreams - Stock: 12 units",
      time: "1 hour ago"
    },
    {
      id: 4,
      type: "order",
      icon: ShoppingCart,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      title: "Order completed",
      description: "Order #ORD-520 delivered successfully",
      time: "2 hours ago"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="admin" />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader role="admin" userName="Admin User" userEmail="admin@keycaps.com" />
        
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Overview Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-2">{stats.totalRevenue}</div>
              <div className="flex items-center gap-1 text-sm text-green-600 font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.revenueGrowth} from last month</span>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Total Orders</span>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-2">{stats.totalOrders}</div>
              <div className="flex items-center gap-1 text-sm text-green-600 font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.ordersGrowth} from last month</span>
              </div>
            </div>

            {/* Total Customers */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Total Customers</span>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-2">{stats.totalCustomers}</div>
              <div className="flex items-center gap-1 text-sm text-green-600 font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.customersGrowth} from last month</span>
              </div>
            </div>

            {/* Avg Order Value */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Avg Order Value</span>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-2">{stats.avgOrderValue}</div>
              <div className="flex items-center gap-1 text-sm text-green-600 font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.avgGrowth} from last month</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-4 pb-4 last:pb-0 border-b border-gray-100 last:border-0"
                  >
                    <div className={`w-12 h-12 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className={`w-6 h-6 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-500 truncate">{activity.description}</div>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <DashboardFooter role="admin" />
      </div>
    </div>
    </div>
  );
}
