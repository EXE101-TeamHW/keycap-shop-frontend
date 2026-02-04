import { useState } from "react";
import { Users, Package, DollarSign, TrendingUp, Settings, Shield, BarChart3, UserCog, Plus, Edit, Trash2, Eye } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Staff" | "Customer";
  status: "Active" | "Inactive";
  joinDate: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sales: number;
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "products" | "settings">("overview");
  const [users, setUsers] = useState<User[]>([
    { id: "U001", name: "Admin User", email: "admin@keycaps.com", role: "Admin", status: "Active", joinDate: "2025-01-01" },
    { id: "U002", name: "Staff Member", email: "staff@keycaps.com", role: "Staff", status: "Active", joinDate: "2025-06-15" },
    { id: "U003", name: "John Doe", email: "john@example.com", role: "Customer", status: "Active", joinDate: "2026-01-20" },
    { id: "U004", name: "Jane Smith", email: "jane@example.com", role: "Customer", status: "Active", joinDate: "2026-02-01" },
  ]);

  const [products] = useState<Product[]>([
    { id: "1", name: "Neon Dreams", price: 89.99, stock: 12, sales: 143 },
    { id: "2", name: "Cyber Punk", price: 129.99, stock: 8, sales: 98 },
    { id: "3", name: "Minimalist White", price: 69.99, stock: 15, sales: 201 },
    { id: "4", name: "Retro Wave", price: 99.99, stock: 20, sales: 156 },
  ]);

  const stats = {
    totalRevenue: "$45,231",
    totalOrders: 523,
    totalCustomers: 1842,
    avgOrderValue: "$86.50"
  };

  const updateUserRole = (userId: string, newRole: User["role"]) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" } 
        : user
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-gray-900" />
          <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <p className="text-gray-600">Complete control and analytics</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="flex gap-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "border-gray-900 text-gray-900 bg-gray-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "users"
                ? "border-gray-900 text-gray-900 bg-gray-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "products"
                ? "border-gray-900 text-gray-900 bg-gray-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Package className="w-5 h-5" />
            Products
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "settings"
                ? "border-gray-900 text-gray-900 bg-gray-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Revenue</span>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalRevenue}</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Orders</span>
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+8.3% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Customers</span>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+15.2% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Avg Order Value</span>
                <DollarSign className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.avgOrderValue}</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+5.7% from last month</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">New order placed</div>
                  <div className="text-sm text-gray-500">Order #ORD-523 - $129.99</div>
                </div>
                <div className="text-sm text-gray-500">2 minutes ago</div>
              </div>
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">New user registered</div>
                  <div className="text-sm text-gray-500">sarah.wilson@example.com</div>
                </div>
                <div className="text-sm text-gray-500">15 minutes ago</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Product stock updated</div>
                  <div className="text-sm text-gray-500">Neon Dreams - Stock: 12 units</div>
                </div>
                <div className="text-sm text-gray-500">1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Join Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{user.id}</td>
                      <td className="py-4 px-4 text-gray-900">{user.name}</td>
                      <td className="py-4 px-4 text-gray-600">{user.email}</td>
                      <td className="py-4 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as User["role"])}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border border-gray-200 bg-white"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Staff">Staff</option>
                          <option value="Customer">Customer</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{user.joinDate}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button className="text-gray-600 hover:text-gray-900 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
            <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sales</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{product.id}</td>
                      <td className="py-4 px-4 text-gray-900">{product.name}</td>
                      <td className="py-4 px-4 text-gray-900 font-semibold">${product.price}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.stock < 10 
                            ? "bg-red-100 text-red-700" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{product.sales} sold</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button className="text-gray-600 hover:text-gray-900 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">System Settings</h3>
          <div className="space-y-6">
            <div className="pb-6 border-b border-gray-200">
              <h4 className="font-semibold mb-4 text-gray-900">General Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="font-medium mb-2 block text-gray-700">Site Name</label>
                  <input
                    type="text"
                    defaultValue="KEYCAPS"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="font-medium mb-2 block text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    defaultValue="contact@keycaps.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pb-6 border-b border-gray-200">
              <h4 className="font-semibold mb-4 text-gray-900">Payment Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Stripe Integration</div>
                    <div className="text-sm text-gray-600">Accept credit card payments</div>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">PayPal Integration</div>
                    <div className="text-sm text-gray-600">Accept PayPal payments</div>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">Security Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600">Require 2FA for admin accounts</div>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>
              </div>
            </div>

            <button className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
