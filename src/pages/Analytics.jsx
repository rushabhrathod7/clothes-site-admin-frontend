import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { IndianRupee, ShoppingCart, Users, Package } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
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

const Analytics = () => {
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuthStore();
    const [dashboardStats, setDashboardStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [productData, setProductData] = useState([]);
    const [userData, setUserData] = useState(null);
    const [timeRange, setTimeRange] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/signin');
            return;
        }
        fetchDashboardStats();
        fetchSalesData();
        fetchProductData();
        fetchUserData();
    }, [timeRange, isAuthenticated, token, navigate]);

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('/admin/analytics/dashboard');
            setDashboardStats(response.data.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Failed to fetch dashboard statistics');
            if (error.response?.status === 401) {
                useAuthStore.getState().logout();
                navigate('/signin');
            }
        }
    };

    const fetchSalesData = async () => {
        try {
            const response = await api.get(`/admin/analytics/sales?period=${timeRange}`);
            setSalesData(response.data.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching sales data:', error);
            setError('Failed to fetch sales data');
            if (error.response?.status === 401) {
                useAuthStore.getState().logout();
                navigate('/signin');
            }
        }
    };

    const fetchProductData = async () => {
        try {
            const response = await api.get('/admin/analytics/products');
            setProductData(response.data.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching product data:', error);
            setError('Failed to fetch product data');
            if (error.response?.status === 401) {
                useAuthStore.getState().logout();
                navigate('/signin');
            }
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await api.get('/admin/analytics/users');
            setUserData(response.data.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to fetch user data');
            if (error.response?.status === 401) {
                useAuthStore.getState().logout();
                navigate('/signin');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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

    if (!dashboardStats) return null;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{Number(dashboardStats?.totalRevenue || 0).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Online: ₹{Number(dashboardStats?.onlineRevenue || 0).toFixed(2)}
                            <span className={`ml-2 ${dashboardStats?.onlineRevenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({dashboardStats?.onlineRevenueChange >= 0 ? '+' : ''}{dashboardStats?.onlineRevenueChange}%)
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Offline: ₹{Number(dashboardStats?.offlineRevenue || 0).toFixed(2)}
                            <span className={`ml-2 ${dashboardStats?.offlineRevenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({dashboardStats?.offlineRevenueChange >= 0 ? '+' : ''}{dashboardStats?.offlineRevenueChange}%)
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(dashboardStats?.totalOrders || 0)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Online: {Number(dashboardStats?.onlineOrders || 0)}
                            <span className={`ml-2 ${dashboardStats?.onlineOrdersChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({dashboardStats?.onlineOrdersChange >= 0 ? '+' : ''}{dashboardStats?.onlineOrdersChange}%)
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Offline: {Number(dashboardStats?.offlineOrders || 0)}
                            <span className={`ml-2 ${dashboardStats?.offlineOrdersChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({dashboardStats?.offlineOrdersChange >= 0 ? '+' : ''}{dashboardStats?.offlineOrdersChange}%)
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(dashboardStats?.totalUsers || 0)}</div>
                        <p className={`text-xs ${dashboardStats?.usersChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {dashboardStats?.usersChange >= 0 ? '+' : ''}{dashboardStats?.usersChange}% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(dashboardStats?.totalProducts || 0)}</div>
                        <p className="text-xs text-muted-foreground">
                            Total products in inventory
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Chart */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>
                            Sales performance over time
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="_id" 
                                        tickFormatter={(value) => {
                                            try {
                                                if (!value) return '';
                                                
                                                if (timeRange === 'weekly') {
                                                    const [year, week] = value.split('-');
                                                    if (!year || !week) return value;
                                                    return `Week ${week}`;
                                                } else if (timeRange === 'monthly') {
                                                    const [year, month] = value.split('-');
                                                    if (!year || !month) return value;
                                                    const date = new Date(parseInt(year), parseInt(month) - 1);
                                                    if (isNaN(date.getTime())) return value;
                                                    return format(date, 'MMM yyyy');
                                                } else {
                                                    const [year, month, day] = value.split('-');
                                                    if (!year || !month || !day) return value;
                                                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                                    if (isNaN(date.getTime())) return value;
                                                    return format(date, 'MMM dd');
                                                }
                                            } catch (error) {
                                                console.error('Error formatting date:', error);
                                                return value;
                                            }
                                        }}
                                    />
                                    <YAxis tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip 
                                        formatter={(value, name) => {
                                            if (name === 'onlineTotal') return [`₹${value}`, 'Online Sales'];
                                            if (name === 'offlineTotal') return [`₹${value}`, 'Offline Sales'];
                                            return [`₹${value}`, 'Total Sales'];
                                        }}
                                        labelFormatter={(label) => {
                                            try {
                                                if (!label) return '';
                                                
                                                if (timeRange === 'weekly') {
                                                    const [year, week] = label.split('-');
                                                    if (!year || !week) return label;
                                                    return `Week ${week}, ${year}`;
                                                } else if (timeRange === 'monthly') {
                                                    const [year, month] = label.split('-');
                                                    if (!year || !month) return label;
                                                    const date = new Date(parseInt(year), parseInt(month) - 1);
                                                    if (isNaN(date.getTime())) return label;
                                                    return format(date, 'MMMM yyyy');
                                                } else {
                                                    const [year, month, day] = label.split('-');
                                                    if (!year || !month || !day) return label;
                                                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                                    if (isNaN(date.getTime())) return label;
                                                    return format(date, 'MMM dd, yyyy');
                                                }
                                            } catch (error) {
                                                console.error('Error formatting tooltip date:', error);
                                                return label;
                                            }
                                        }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="onlineTotal" 
                                        name="onlineTotal"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="offlineTotal" 
                                        name="offlineTotal"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="total" 
                                        name="total"
                                        stroke="#ffc658"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>
                            Best performing products by revenue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="productDetails[0].name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                    />
                                    <YAxis tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip 
                                        formatter={(value) => [`₹${value}`, 'Revenue']}
                                        labelFormatter={(label) => label}
                                    />
                                    <Bar 
                                        dataKey="totalRevenue" 
                                        fill="#82ca9d"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Growth */}
            <Card>
                <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>
                        New user registrations over time
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userData?.userStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="_id"
                                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                />
                                <YAxis />
                                <Tooltip 
                                    labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="newUsers" 
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Analytics; 