import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2, Plus, Search, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";

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
    console.log('Making request to:', config.url);
    console.log('With token:', token ? 'Token present' : 'No token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Request failed:', error.config?.url, error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

const OfflineSalesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();
  const [searchParams] = useSearchParams();
  
  // State for orders list
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State for new order creation
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  // Add loading state for subcategories
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [lastFetchedCategory, setLastFetchedCategory] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated, redirecting to signin');
      navigate('/signin');
      return;
    }
  }, [isAuthenticated, token, navigate]);

  // Check for modal query parameter on mount
  useEffect(() => {
    const modalParam = searchParams.get('modal');
    if (modalParam === 'new') {
      setCurrentStep(1);
      setIsNewOrderDialogOpen(true);
    }
  }, [searchParams]);

  // Fetch orders
  const fetchOrders = async () => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated, skipping fetchOrders');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/admin/offline-orders');
      setOrders(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching offline orders:', err);
      setError('Failed to fetch offline orders');
      if (err.response?.status === 401) {
        useAuthStore.getState().logout();
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated, skipping fetchCategories');
      return;
    }

    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to fetch categories');
      if (err.response?.status === 401) {
        useAuthStore.getState().logout();
        navigate('/signin');
      }
    }
  };

  // Fetch subcategories when category is selected
  const fetchSubcategories = async (categoryId) => {
    // Don't fetch if we're already loading or if it's the same category
    if (!isAuthenticated || !token || !categoryId || 
        loadingSubcategories || lastFetchedCategory === categoryId) {
      return;
    }

    try {
      setLoadingSubcategories(true);
      console.log('Fetching subcategories for category:', categoryId);
      const response = await api.get(`/admin/subcategories?category=${categoryId}`);
      console.log('Subcategories response:', response.data.data);
      setSubcategories(response.data.data);
      setLastFetchedCategory(categoryId);
      // Clear products when category changes
      setProducts([]);
      setSelectedSubcategory("");
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      toast.error('Failed to fetch subcategories');
      if (err.response?.status === 401) {
        useAuthStore.getState().logout();
        navigate('/signin');
      }
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Fetch products when subcategory is selected
  const fetchProducts = async (subcategoryId) => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated, skipping fetchProducts');
      return;
    }

    try {
      console.log('Fetching products for subcategory:', subcategoryId);
      const response = await api.get(`/admin/products?subcategory=${subcategoryId}&status=active`);
      console.log('Products response:', response.data.data);
      setProducts(response.data.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to fetch products');
      if (err.response?.status === 401) {
        useAuthStore.getState().logout();
        navigate('/signin');
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
      fetchCategories();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (selectedSubcategory) {
      fetchProducts(selectedSubcategory);
    } else {
      // Clear products when no subcategory is selected
      setProducts([]);
    }
  }, [selectedSubcategory]);

  const handleCreateOrder = async () => {
    try {
      if (selectedProducts.length === 0) {
        toast.error('Please select at least one product');
        return;
      }
  
      if (!customerData.name || !customerData.phone) {
        toast.error('Please fill in all customer details');
        return;
      }
  
      const subtotal = selectedProducts.reduce((sum, product) => 
        sum + (product.price * (product.quantity || 1)), 0
      );
      const tax = subtotal * 0.18;
      const shipping = subtotal >= 1000 ? 0 : 50;
      const total = subtotal + tax + shipping;

      const orderData = {
        customerName: customerData.name,
        phone: customerData.phone,
        items: selectedProducts.map(product => ({
          productId: product._id,
          name: product.name,
          quantity: product.quantity || 1,
          price: product.price,
          variant: product.variant || null,
          images: product.images || []
        })),
        payment: {
          method: customerData.paymentMethod,
          status: 'completed',
          amount: total
        },
        subtotal,
        tax,
        shipping,
        total,
        status: 'completed'
      };
  
      const response = await api.post('/admin/offline-orders', orderData);
      setOrders([response.data.data, ...orders]);
      setIsNewOrderDialogOpen(false);
      resetNewOrderForm();
      toast.success('Order created successfully');
    } catch (err) {
      console.error('Error creating offline order:', err.response?.data || err);
      toast.error(err.response?.data?.error || 'Failed to create offline order');
      if (err.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/signin';
      }
    }
  };

  const resetNewOrderForm = () => {
    setCurrentStep(1);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedProducts([]);
    setCustomerData({
      name: "",
      phone: "",
      paymentMethod: "cash"
    });
  };

  const addProductToOrder = (product) => {
    console.log('Adding product to order:', product);
    setSelectedProducts(prev => {
      const existingProduct = prev.find(p => p._id === product._id);
      if (existingProduct) {
        return prev.map(p => 
          p._id === product._id 
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeProductFromOrder = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p._id !== productId));
  };

  const updateProductQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setSelectedProducts(prev => 
      prev.map(p => p._id === productId ? { ...p, quantity } : p)
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-500",
      pending: "bg-yellow-500",
      cancelled: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const filteredOrders = orders.filter(order => 
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update the Next button click handler in the dialog
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedCategory) {
        toast.error('Please select a category');
        return;
      }
      if (!selectedSubcategory) {
        toast.error('Please select a subcategory');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedProducts.length === 0) {
        toast.error('Please select at least one product');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!customerData.name || !customerData.phone) {
        toast.error('Please fill in all customer details');
        return;
      }
      setCurrentStep(4);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    if (categoryId === selectedCategory) {
      // If clicking the same category, deselect it
      setSelectedCategory("");
      setSubcategories([]);
      setProducts([]);
      setSelectedSubcategory("");
      setLastFetchedCategory(null);
    } else {
      // Select new category
      setSelectedCategory(categoryId);
      fetchSubcategories(categoryId);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Offline Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Offline Sales</CardTitle>
          <Button onClick={() => setIsNewOrderDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8">No offline sales found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {item.images && item.images[0] && (
                              <img 
                                src={item.images[0].url} 
                                alt={item.name}
                                className="w-8 h-8 object-cover rounded-md"
                              />
                            )}
                            <div>
                              <span className="text-sm font-medium">{item.quantity}x</span>
                              <span className="text-sm ml-1">{item.name}</span>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₹{order.total.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{order.payment.method}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Order Dialog */}
      <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Offline Sale</DialogTitle>
            <DialogDescription>
              Follow the steps to create a new offline sale
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Step 1: Category and Subcategory Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categories.map((category) => (
                        <div
                          key={category._id}
                          onClick={() => handleCategorySelect(category._id)}
                          className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedCategory === category._id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-gray-200 hover:border-primary/50"
                          }`}
                        >
                          {selectedCategory === category._id && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                          {category.image && (
                            <div className="w-full h-32 mb-2 overflow-hidden rounded-md">
                              <img
                                src={category.image.url}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h3 className="font-medium text-center">{category.name}</h3>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedCategory && (
                    <div className="space-y-2">
                      <Label>Subcategory</Label>
                      {loadingSubcategories ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : subcategories.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {subcategories.map((subcategory) => (
                            <div
                              key={subcategory._id}
                              onClick={() => setSelectedSubcategory(subcategory._id)}
                              className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedSubcategory === subcategory._id
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                  : "border-gray-200 hover:border-primary/50"
                              }`}
                            >
                              {selectedSubcategory === subcategory._id && (
                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                              {subcategory.image && (
                                <div className="w-full h-32 mb-2 overflow-hidden rounded-md">
                                  <img
                                    src={subcategory.image.url}
                                    alt={subcategory.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <h3 className="font-medium text-center">{subcategory.name}</h3>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground p-4">
                          No subcategories found for this category
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Product Selection */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Available Products</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {products.length === 0 ? (
                        <div className="text-center text-muted-foreground p-4">
                          No products found in this subcategory
                        </div>
                      ) : (
                        products.map((product) => (
                          <div
                            key={product._id}
                            className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => addProductToOrder(product)}
                          >
                            <div className="flex items-center gap-2">
                              {product.images && product.images[0] && (
                                <img 
                                  src={product.images[0].url} 
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                              )}
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  ₹{product.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Selected Products</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {selectedProducts.length === 0 ? (
                        <div className="text-center text-muted-foreground p-4">
                          No products selected yet
                        </div>
                      ) : (
                        selectedProducts.map((product) => (
                          <div
                            key={product._id}
                            className="flex items-center justify-between p-2 border rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              {product.images && product.images[0] && (
                                <img 
                                  src={product.images[0].url} 
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                              )}
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  ₹{product.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProductQuantity(product._id, (product.quantity || 1) - 1)}
                              >
                                -
                              </Button>
                              <span>{product.quantity || 1}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProductQuantity(product._id, (product.quantity || 1) + 1)}
                              >
                                +
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProductFromOrder(product._id)}
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Customer Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={customerData.paymentMethod}
                      onValueChange={(value) => setCustomerData(prev => ({ ...prev, paymentMethod: value }))}
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
                </div>
              </div>
            )}

            {/* Step 4: Order Summary */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Customer Name:</span>
                      <span>{customerData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span>{customerData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="capitalize">{customerData.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Selected Products</h4>
                    <div className="space-y-2">
                      {selectedProducts.map((product) => (
                        <div key={product._id} className="flex justify-between">
                          <span>
                            {product.name} x {product.quantity || 1}
                          </span>
                          <span>₹{(product.price * (product.quantity || 1)).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-4 pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{selectedProducts.reduce((sum, product) => 
                          sum + (product.price * (product.quantity || 1)), 0
                        ).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (18% GST):</span>
                        <span>₹{(selectedProducts.reduce((sum, product) => 
                          sum + (product.price * (product.quantity || 1)), 0
                        ) * 0.18).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>₹{(selectedProducts.reduce((sum, product) => 
                          sum + (product.price * (product.quantity || 1)), 0
                        ) >= 1000 ? 0 : 50).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>₹{(() => {
                          const subtotal = selectedProducts.reduce((sum, product) => 
                            sum + (product.price * (product.quantity || 1)), 0
                          );
                          const tax = subtotal * 0.18;
                          const shipping = subtotal >= 1000 ? 0 : 50;
                          return (subtotal + tax + shipping).toFixed(2);
                        })()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous
              </Button>
            )}
            {currentStep < 4 ? (
              <Button onClick={handleNextStep}>
                Next
              </Button>
            ) : (
              <Button onClick={handleCreateOrder}>
                Create Order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Sale Details - {selectedOrder.orderNumber}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        {item.images && item.images[0] && (
                          <img 
                            src={item.images[0].url} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.variant && (
                                <p className="text-sm text-muted-foreground">
                                  {Object.entries(item.variant).map(([key, value]) => (
                                    <span key={key} className="mr-2">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </p>
                              )}
                            </div>
                            <p className="font-medium">₹{item.price.toFixed(2)}</p>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                            <p className="font-medium">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-medium capitalize">{selectedOrder.payment.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfflineSalesPage; 