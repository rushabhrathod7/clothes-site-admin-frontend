import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Store,
  Users,
  CreditCard,
  Star,
  TrendingUp,
  Plus,
  Search,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import ImageUpload from "@/components/ui/ImageUpload";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalOfflineSales: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentOfflineSales, setRecentOfflineSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for modals
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [currentSaleStep, setCurrentSaleStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    paymentMethod: "cash"
  });

  // New sale form state
  const [saleFormData, setSaleFormData] = useState({
    customerName: "",
    items: [{ productId: "", quantity: 1, price: "" }],
    paymentMethod: "cash",
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/signin');
      return;
    }
    fetchDashboardData();
    fetchCategories();
  }, [isAuthenticated, token, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, offlineSalesRes] = await Promise.all([
        api.get('/admin/analytics/dashboard'),
        api.get('/admin/orders?limit=5&sort=-createdAt'),
        api.get('/admin/offline-orders?limit=5&sort=-createdAt'),
      ]);

      // Transform dashboard stats
      const dashboardStats = statsRes.data.data;
      setStats({
        totalProducts: dashboardStats.totalProducts || 0,
        totalOrders: dashboardStats.onlineOrders || 0,
        totalOfflineSales: dashboardStats.offlineOrders || 0,
        totalCustomers: dashboardStats.totalUsers || 0,
        totalRevenue: dashboardStats.totalRevenue || 0,
        totalReviews: dashboardStats.totalReviews || dashboardStats.reviews || 0,
      });

      // Set recent orders and sales
      setRecentOrders(ordersRes.data.data || []);
      setRecentOfflineSales(offlineSalesRes.data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        navigate('/signin');
      } else if (error.response?.status === 404) {
        // If endpoints are not ready, use mock data temporarily
        const mockStats = {
          totalProducts: 150,
          totalOrders: 45,
          totalOfflineSales: 28,
          totalCustomers: 120,
          totalRevenue: 12500,
          totalReviews: 89,
        };

        const mockOrders = [
          {
            _id: "1",
            orderNumber: "ORD-001",
            total: 299.99,
            status: "Completed",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "2",
            orderNumber: "ORD-002",
            total: 149.99,
            status: "Processing",
            createdAt: new Date().toISOString(),
          },
        ];

        const mockOfflineSales = [
          {
            _id: "1",
            orderNumber: "POS-001",
            total: 199.99,
            payment: { method: "Cash" },
            createdAt: new Date().toISOString(),
          },
          {
            _id: "2",
            orderNumber: "POS-002",
            total: 399.99,
            payment: { method: "Card" },
            createdAt: new Date().toISOString(),
          },
        ];

        setStats(mockStats);
        setRecentOrders(mockOrders);
        setRecentOfflineSales(mockOfflineSales);
        setError(null);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const quickActionCards = [
    {
      title: "Add New Product",
      description: "Create a new product listing",
      icon: Package,
      path: "/products/new",
      color: "bg-blue-500",
    },
    {
      title: "New Offline Sale",
      description: "Record a new offline sale",
      icon: Store,
      path: "/offline-sales/new",
      color: "bg-green-500",
    },
    {
      title: "View Analytics",
      description: "Check sales and performance metrics",
      icon: TrendingUp,
      path: "/analytics",
      color: "bg-purple-500",
    },
    {
      title: "Manage Categories",
      description: "Organize your product categories",
      icon: Package,
      path: "/categories",
      color: "bg-orange-500",
    },
  ];

  // Sale form handlers
  const handleSaleChange = (e) => {
    const { name, value } = e.target;
    setSaleFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...saleFormData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Calculate subtotal
    const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate tax (18% GST)
    const tax = subtotal * 0.18;
    
    // Calculate shipping (free for orders above ₹1000, else ₹50)
    const shipping = subtotal >= 1000 ? 0 : 50;
    
    // Calculate total
    const total = subtotal + tax + shipping;

    setSaleFormData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      tax,
      shipping,
      total,
    }));
  };

  const addItem = () => {
    setSaleFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, price: "" }],
    }));
  };

  const removeItem = (index) => {
    setSaleFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate subtotal
      const subtotal = saleFormData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate tax (18% GST)
      const tax = subtotal * 0.18;
      
      // Calculate shipping (free for orders above ₹1000, else ₹50)
      const shipping = subtotal >= 1000 ? 0 : 50;
      
      // Calculate total
      const total = subtotal + tax + shipping;

      const orderData = {
        ...saleFormData,
        subtotal,
        tax,
        shipping,
        total,
        payment: {
          method: saleFormData.paymentMethod,
          status: 'completed',
          amount: total
        }
      };

      const response = await api.post("/admin/offline-orders", orderData);

      if (response.data.success) {
        toast.success("Offline sale recorded successfully!");
        setIsNewSaleModalOpen(false);
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error creating offline sale:", error);
      toast.error(error.response?.data?.message || "Failed to record offline sale");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your store today.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Online Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Offline Sales</CardTitle>
            <Store className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOfflineSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Number(stats.totalRevenue).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActionCards.map((card, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              if (card.path === "/products/new") {
                navigate('/products?modal=new');
              } else if (card.path === "/offline-sales/new") {
                navigate('/offline-sales?modal=new');
              } else {
                navigate(card.path);
              }
            }}
          >
            <CardContent className="p-6">
              <div className={`${card.color} p-3 rounded-lg w-fit mb-4`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Online Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Online Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{Number(order.total).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Offline Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Offline Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOfflineSales.map((sale) => (
                <div
                  key={sale._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Sale #{sale.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{Number(sale.total).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{sale.payment.method}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Sale Modal */}
      <Dialog open={isNewSaleModalOpen} onOpenChange={setIsNewSaleModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record New Offline Sale</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                value={saleFormData.customerName}
                onChange={handleSaleChange}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button type="button" variant="outline" onClick={addItem}>
                  Add Item
                </Button>
              </div>

              {saleFormData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Input
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                      placeholder="Product ID"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeItem(index)}
                    disabled={saleFormData.items.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={saleFormData.paymentMethod}
                onValueChange={(value) => handleSaleChange({ target: { name: "paymentMethod", value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Order Summary</Label>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{saleFormData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18% GST):</span>
                  <span>₹{saleFormData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>₹{saleFormData.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{saleFormData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewSaleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Recording..." : "Record Sale"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
