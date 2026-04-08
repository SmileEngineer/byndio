import { useState } from 'react';
import {
  ArrowLeft,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  IndianRupee,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  Bell,
  Settings,
  LogOut,
  Store,
  MapPin,
  Star,
  MessageSquare,
  Truck,
  RefreshCcw
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select } from './ui/select';
import { Avatar } from './ui/avatar';

interface AdminDashboardProps {
  onClose: () => void;
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    {
      title: 'Total Sales',
      value: '₹1,24,567',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Orders',
      value: '247',
      change: '+8.2%',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Products',
      value: '156',
      change: '+5',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Customers',
      value: '1,234',
      change: '+18.7%',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const recentOrders = [
    {
      id: '#ORD-1234',
      customer: 'Rahul Sharma',
      product: 'Wireless Earbuds',
      amount: 1299,
      status: 'delivered',
      date: '2 hours ago',
      location: 'Mumbai, MH'
    },
    {
      id: '#ORD-1235',
      customer: 'Priya Patel',
      product: 'Cotton T-Shirt',
      amount: 599,
      status: 'processing',
      date: '3 hours ago',
      location: 'Pune, MH'
    },
    {
      id: '#ORD-1236',
      customer: 'Amit Kumar',
      product: 'Smart Watch',
      amount: 2499,
      status: 'shipped',
      date: '5 hours ago',
      location: 'Delhi, DL'
    },
    {
      id: '#ORD-1237',
      customer: 'Sneha Gupta',
      product: 'Denim Jeans',
      amount: 1499,
      status: 'pending',
      date: '6 hours ago',
      location: 'Bangalore, KA'
    },
    {
      id: '#ORD-1238',
      customer: 'Vikram Singh',
      product: 'Leather Wallet',
      amount: 799,
      status: 'cancelled',
      date: '8 hours ago',
      location: 'Chennai, TN'
    }
  ];

  const topProducts = [
    {
      id: 'P001',
      name: 'Wireless Earbuds',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&h=100&fit=crop',
      sold: 142,
      revenue: 184458,
      stock: 23,
      rating: 4.5
    },
    {
      id: 'P002',
      name: 'Smart Watch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
      sold: 98,
      revenue: 244902,
      stock: 15,
      rating: 4.6
    },
    {
      id: 'P003',
      name: 'Cotton T-Shirt',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
      sold: 87,
      revenue: 52113,
      stock: 45,
      rating: 4.3
    },
    {
      id: 'P004',
      name: 'Running Shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
      sold: 76,
      revenue: 167124,
      stock: 8,
      rating: 4.7
    }
  ];

  const notifications = [
    { type: 'order', message: 'New order received #ORD-1234', time: '2 min ago' },
    { type: 'review', message: 'New review on Wireless Earbuds', time: '15 min ago' },
    { type: 'stock', message: 'Low stock alert for Running Shoes', time: '1 hour ago' },
    { type: 'payment', message: 'Payment received ₹2,499', time: '2 hours ago' }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      delivered: { variant: 'default' as const, className: 'bg-green-600' },
      processing: { variant: 'default' as const, className: 'bg-blue-600' },
      shipped: { variant: 'default' as const, className: 'bg-purple-600' },
      pending: { variant: 'default' as const, className: 'bg-yellow-600' },
      cancelled: { variant: 'destructive' as const, className: '' }
    };
    const { variant, className } = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge variant={variant} className={className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Seller Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your store</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders, products, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs text-green-600 font-medium">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.title}</div>
            </Card>
          ))}
        </div>

        {/* Store Info Card */}
        <Card className="p-4 bg-gradient-to-br from-primary to-[#2196f3] text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Premium Electronics Store</h3>
                <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>Mumbai, Maharashtra</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm opacity-90">Rating</div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">4.6</span>
              </div>
            </div>
            <div>
              <div className="text-sm opacity-90">Reviews</div>
              <div className="font-semibold mt-1">1,234</div>
            </div>
            <div>
              <div className="text-sm opacity-90">Since</div>
              <div className="font-semibold mt-1">2023</div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Plus className="w-5 h-5" />
                  <span className="text-sm">Add Product</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Download className="w-5 h-5" />
                  <span className="text-sm">Export Data</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">Messages</span>
                </Button>
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Recent Orders</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-3">
                {recentOrders.slice(0, 3).map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">{order.id}</div>
                        <div className="text-xs text-muted-foreground">{order.customer}</div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm mb-2">{order.product}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{order.date}</span>
                      <span className="font-semibold">₹{order.amount.toLocaleString()}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Top Products</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-3">
                {topProducts.map((product) => (
                  <Card key={product.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm mb-1">{product.name}</div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Sold: {product.sold}</span>
                          <span>Stock: {product.stock}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            <span>{product.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">₹{product.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4 mt-6">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium">{order.id}</div>
                      <div className="text-sm text-muted-foreground">{order.customer}</div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Product</span>
                      <span>{order.product}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold">₹{order.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Location</span>
                      <span>{order.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time</span>
                      <span>{order.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Truck className="w-4 h-4 mr-1" />
                      Track
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4 mt-6">
            <Button className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>

            <div className="space-y-3">
              {topProducts.map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium mb-1">{product.name}</div>
                      <div className="text-sm text-muted-foreground mb-2">ID: {product.id}</div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sold: </span>
                          <span className="font-medium">{product.sold}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stock: </span>
                          <span className={`font-medium ${product.stock < 10 ? 'text-destructive' : ''}`}>
                            {product.stock}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span className="font-medium">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <Button variant="ghost" className="w-full gap-2 text-destructive hover:text-destructive">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
