import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreVertical, Edit, Trash, ImageIcon, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast, Toaster } from "sonner";
import ImageUpload from "@/components/ui/ImageUpload";
import api from "@/services/api";
import { useSearchParams } from "react-router-dom";

const ProductForm = React.memo(
  ({ initialData, onSubmit, onClose, isEdit, categories, subcategories }) => {
    const [formData, setFormData] = useState(initialData);
    const [availableSubcategories, setAvailableSubcategories] = useState([]);

    useEffect(() => {
      if (formData.category && subcategories) {
        const filtered = subcategories.filter(
          (sub) => sub.category._id === formData.category
        );
        setAvailableSubcategories(filtered);
      }
    }, [formData.category, subcategories]);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleFieldChange = (field, value) => {
      setFormData((prev) => {
        if (field === "category") {
          return { ...prev, category: value, subcategory: "" };
        }
        return { ...prev, [field]: value };
      });
    };

    const handleImageChange = (images) => {
      console.log('handleImageChange called with:', images);
      
      // If no images are provided or empty array, set images to empty array
      if (!images || images.length === 0) {
        console.log('No images provided, setting images to empty array');
        setFormData(prev => ({ ...prev, images: [] }));
        return;
      }
      
      // Set the images array
      console.log('Setting new images:', images);
      setFormData(prev => ({ ...prev, images }));
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sku" className="text-right">
              SKU
            </Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => handleFieldChange("sku", e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="images" className="text-right">
              Product Images
            </Label>
            <div className="col-span-3">
              <ImageUpload
                value={formData.images || []}
                onChange={handleImageChange}
                maxFiles={5}
                folder="products"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload up to 5 images for this product
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleFieldChange("category", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.category && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subcategory" className="text-right">
                Subcategory
              </Label>
              <Select
                value={formData.subcategory}
                onValueChange={(value) =>
                  handleFieldChange("subcategory", value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory._id} value={subcategory._id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                handleFieldChange("price", Number(e.target.value))
              }
              className="col-span-3"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Stock
            </Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                handleFieldChange("stock", Number(e.target.value))
              }
              className="col-span-3"
              min="0"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isAvailable" className="text-right">
              Available
            </Label>
            <Select
              value={formData.isAvailable.toString()}
              onValueChange={(value) =>
                handleFieldChange("isAvailable", value === "true")
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newlyArrived" className="text-right">
              Newly Arrived
            </Label>
            <Select
              value={formData.newlyArrived.toString()}
              onValueChange={(value) =>
                handleFieldChange("newlyArrived", value === "true")
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select newly arrived status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="featured" className="text-right">
              Featured
            </Label>
            <Select
              value={formData.featured.toString()}
              onValueChange={(value) =>
                handleFieldChange("featured", value === "true")
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select featured status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? "Save Changes" : "Add Product"}
          </Button>
        </DialogFooter>
      </form>
    );
  }
);

ProductForm.displayName = "ProductForm";

const SearchInput = React.memo(({ value, onChange }) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search products..."
        className="pl-8"
        value={value}
        onChange={onChange}
      />
    </div>
  );
});

SearchInput.displayName = "SearchInput";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState("-createdAt");

  const [searchParams] = useSearchParams();

  const emptyProduct = {
    name: "",
    description: "",
    sku: "",
    images: [],
    category: "",
    subcategory: "",
    price: "",
    stock: "",
    isAvailable: true,
    newlyArrived: false,
    featured: false,
  };

  // Fetch products
  const fetchProducts = async (
    page = 1,
    limit = 10,
    sort = "-createdAt",
    search = ""
  ) => {
    setLoading(true);
    try {
      let url = `/admin/products?page=${page}&limit=${limit}&sort=${sort}`;

      if (search) {
        url = `/admin/products/search?q=${search}`;
      }

      const response = await api.get(url);
      const data = response.data;

      setProducts(data.data);
      if (data.pagination) {
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setLimit(data.pagination.limit);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch products";
      setError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories");
      setCategories(response.data.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch categories";
      toast.error("Error", {
        description: errorMessage,
      });
    }
  };

  // Fetch subcategories
  const fetchSubcategories = async () => {
    try {
      const response = await api.get("/admin/subcategories");
      setSubcategories(response.data.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch subcategories";
      toast.error("Error", {
        description: errorMessage,
      });
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchProducts(currentPage, limit, sortField),
        fetchCategories(),
        fetchSubcategories(),
      ]);
    };

    loadInitialData();
  }, []);

  // Check for modal query parameter on mount
  useEffect(() => {
    const modalParam = searchParams.get('modal');
    if (modalParam === 'new') {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1, limit, sortField, searchTerm);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page, limit, sortField, searchTerm);
  };

  // Handle add product
  const handleAddProduct = async (formData) => {
    try {
      const response = await api.post("/admin/products", formData);

      // Refetch the products to update the list
      fetchProducts(currentPage, limit, sortField);

      setIsAddModalOpen(false);

      toast.success("Product Added", {
        description: "Product added successfully",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add product";
      toast.error("Error", {
        description: errorMessage,
      });
    }
  };

  // Handle edit product
  const handleEditProduct = async (formData) => {
    try {
      await api.put(`/admin/products/${selectedProduct._id}`, formData);

      // Refetch the products to update the list
      fetchProducts(currentPage, limit, sortField);

      setIsEditModalOpen(false);

      toast.success("Product Updated", {
        description: "Product updated successfully",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update product";
      toast.error("Error", {
        description: errorMessage,
      });
    }
  };

  // Open edit modal
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    toast.promise(
      async () => {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this product?"
        );
        if (!confirmDelete) {
          throw new Error("Deletion cancelled");
        }

        await api.delete(`/admin/products/${productId}`);

        // Refetch the products to update the list
        await fetchProducts(currentPage, limit, sortField);

        return "Product deleted successfully";
      },
      {
        loading: "Deleting product...",
        success: (message) => ({
          title: "Success",
          description: message,
        }),
        error: (err) => ({
          title: "Error",
          description: err.message || "Failed to delete product",
        }),
      }
    );
  };

  // Get status text and color based on stock and availability
  const getProductStatus = (product) => {
    if (!product.isAvailable) {
      return { text: "Unavailable", color: "text-red-600" };
    }

    if (product.stock <= 0) {
      return { text: "Out of Stock", color: "text-red-600" };
    }

    if (product.stock < 10) {
      return { text: "Low Stock", color: "text-yellow-600" };
    }

    return { text: "In Stock", color: "text-green-600" };
  };

  // Add this function to handle dropdown state
  const handleDropdownOpenChange = (productId, isOpen) => {
    setOpenDropdownId(isOpen ? productId : null);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" richColors closeButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <form onSubmit={handleSearchSubmit} className="flex gap-4 mt-4">
            <SearchInput value={searchTerm} onChange={handleSearch} />
            <Button type="submit" variant="secondary">
              Search
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setSearchTerm("");
                fetchProducts(1, limit, sortField);
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">No products found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Featured</TableHead>
                    <TableHead className="text-center">New</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const status = getProductStatus(product);
                    return (
                      <TableRow key={product._id}>
                        <TableCell>
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/100x400";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.category?.name || "—"}</TableCell>
                        <TableCell>
                          {product.subcategory?.name || "—"}
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <span className={status.color}>{status.text}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {product.featured ? (
                            <Star className="h-5 w-5 mx-auto text-yellow-400 fill-yellow-400" />
                          ) : (
                            <Star className="h-5 w-5 mx-auto text-gray-300" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.newlyArrived ? (
                            <span className="inline-flex items-center justify-center h-5 w-5 mx-auto rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                              New
                            </span>
                          ) : (
                            <span className="inline-block h-5 w-5"></span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu 
                            open={openDropdownId === product._id}
                            onOpenChange={(isOpen) => handleDropdownOpenChange(product._id, isOpen)}
                          >
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  openEditModal(product);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleDeleteProduct(product._id);
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first, last, current and 1 page on each side of current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there are gaps
                        if (index > 0 && array[index - 1] !== page - 1) {
                          return (
                            <React.Fragment key={`ellipsis-${page}`}>
                              <PaginationItem>
                                <span className="px-4">...</span>
                              </PaginationItem>
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={page === currentPage}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </React.Fragment>
                          );
                        }
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="top-0 z-10">
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <ProductForm
              initialData={emptyProduct}
              onSubmit={handleAddProduct}
              onClose={() => setIsAddModalOpen(false)}
              isEdit={false}
              categories={categories}
              subcategories={subcategories}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="top-0 bg-white z-10 w-fit">
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {selectedProduct && (
              <ProductForm
                initialData={selectedProduct}
                onSubmit={handleEditProduct}
                onClose={() => setIsEditModalOpen(false)}
                isEdit={true}
                categories={categories}
                subcategories={subcategories}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
