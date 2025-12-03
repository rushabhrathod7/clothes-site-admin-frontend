import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { ImageIcon } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [loadingProducts, setLoadingProducts] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders...");
      const response = await api.get("/admin/orders");
      console.log("API Response:", response.data);
      setOrders(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      let errorMessage = "Failed to fetch orders";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Please log in to view orders";
        } else if (err.response.status === 403) {
          errorMessage = "You do not have permission to view orders";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}`, {
        status: newStatus,
      });
      fetchOrders(); // Refresh orders after update
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status");
    }
  };

  const fetchProductDetails = async (productId) => {
    // Extract the actual ID string if productId is an object
    const actualId =
      productId && typeof productId === "object" && productId._id
        ? productId._id
        : productId;

    if (!actualId || productDetails[actualId]) return;

    setLoadingProducts((prev) => ({ ...prev, [actualId]: true }));
    try {
      const response = await api.get(`/admin/products/${actualId}`);
      console.log("Product details response:", response.data);
      if (response.data.success && response.data.data) {
        setProductDetails((prev) => ({
          ...prev,
          [actualId]: response.data.data,
        }));
      } else {
        console.error("Invalid product data format:", response.data);
      }
    } catch (err) {
      console.error("Error fetching product details:", err);
    } finally {
      setLoadingProducts((prev) => ({ ...prev, [actualId]: false }));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      console.log("Selected order:", JSON.stringify(selectedOrder, null, 2));
      // Fetch product details for each item in the order
      selectedOrder.items.forEach((item) => {
        console.log("Order item:", JSON.stringify(item, null, 2));
        if (item.productId) {
          // Only fetch if productId exists
          fetchProductDetails(item.productId);
        }
      });
    }
  }, [selectedOrder]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      shipped: "bg-purple-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
      confirmed: "bg-blue-500",
      returned: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
  };

  const handleDeleteClick = (order, e) => {
    e.stopPropagation();
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/orders/${orderToDelete._id}`);
      setOrders(orders.filter((order) => order._id !== orderToDelete._id));
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (err) {
      console.error("Error deleting order:", err);
      setError("Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  console.log("Current orders state:", orders);
  console.log("Loading state:", loading);
  console.log("Error state:", error);

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders Management</CardTitle>
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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500 text-center">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">No orders found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(order)}
                  >
                    <TableCell>
                      <div className="font-medium">{order.orderNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {order.userId?.firstName} {order.userId?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.userId?.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shippingAddress?.phone || "No phone"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {item.quantity}x
                            </span>
                            <span className="text-sm">{item.name}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ₹{order.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shipping.method}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.payment.status)}>
                        {order.payment.method.toUpperCase()} -{" "}
                        {order.payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={order.status}
                          onValueChange={(value) =>
                            updateOrderStatus(order._id, value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => handleDeleteClick(order, e)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete order #
              {orderToDelete?.orderNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Order Details - {selectedOrder.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  View detailed information about this order, including customer
                  details, shipping information, and product details.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {selectedOrder.userId?.firstName}{" "}
                          {selectedOrder.userId?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">
                          {selectedOrder.userId?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {selectedOrder.shippingAddress?.phone ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Order Date
                        </p>
                        <p className="font-medium">
                          {format(
                            new Date(selectedOrder.createdAt),
                            "MMM dd, yyyy hh:mm a"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Order Status
                        </p>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment</p>
                        <Badge
                          className={getStatusColor(
                            selectedOrder.payment.status
                          )}
                        >
                          {selectedOrder.payment.method.toUpperCase()} -{" "}
                          {selectedOrder.payment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Shipping Address</h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium">
                      {selectedOrder.shippingAddress?.street}
                    </p>
                    <p>
                      {selectedOrder.shippingAddress?.city},{" "}
                      {selectedOrder.shippingAddress?.state}
                    </p>
                    <p>
                      {selectedOrder.shippingAddress?.country} -{" "}
                      {selectedOrder.shippingAddress?.zipCode}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => {
                      console.log("Order item:", JSON.stringify(item, null, 2)); // Debug log
                      const productDetail = productDetails[item.productId];
                      const isLoading = loadingProducts[item.productId];

                      return (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="w-20 h-20 bg-muted flex-shrink-0 flex items-center justify-center rounded overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error(
                                    "Error loading image:",
                                    item.image
                                  );
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://placehold.co/100x100?text=No+Image";
                                  e.target.className =
                                    "w-full h-full object-contain p-2 bg-white";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-muted-foreground/10 flex flex-col items-center justify-center p-2 text-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">
                                  {item.productExists === false
                                    ? "Product Deleted"
                                    : "No Image"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                {item.variant && (
                                  <p className="text-sm text-muted-foreground">
                                    {Object.entries(item.variant).map(
                                      ([key, value]) => (
                                        <span key={key} className="mr-2">
                                          {key}: {value}
                                        </span>
                                      )
                                    )}
                                  </p>
                                )}
                              </div>
                              <p className="font-medium">
                                ₹{item.price.toFixed(2)}
                              </p>
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
                      );
                    })}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        ₹{selectedOrder.subtotal?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount</span>
                        <span className="text-green-600">
                          -₹{selectedOrder.discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.shippingCost > 0 && (
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>₹{selectedOrder.shippingCost.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹{selectedOrder.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>₹{selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-medium">
                        {selectedOrder.payment.method.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        className={getStatusColor(selectedOrder.payment.status)}
                      >
                        {selectedOrder.payment.status}
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

export default OrdersPage;
