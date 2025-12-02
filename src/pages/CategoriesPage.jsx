import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ui/ImageUpload";
import api from "@/services/api";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    image: null
  });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/categories");
      setCategories(response.data.data);
    } catch (error) {
      toast.error("Failed to load categories", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (checked) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleImageChange = (images) => {
    console.log('handleImageChange called with:', images);
    
    // If no images are provided or empty array, set image to null
    // This will trigger the backend to remove the image
    if (!images || images.length === 0) {
      console.log('No images provided, setting image to null');
      setFormData(prev => ({ ...prev, image: null }));
      return;
    }
    
    // Take the first image since categories only need one image
    const image = images[0];
    console.log('Setting new image:', image);
    setFormData(prev => ({ ...prev, image }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form with data:', formData);
      
      if (editId) {
        // First verify the category still exists
        try {
          await api.get(`/admin/categories/${editId}`);
          
          // If we get here, the category exists, so proceed with update
          await api.put(`/admin/categories/${editId}`, formData);
          toast.success("Category updated successfully");
        } catch (categoryError) {
          if (categoryError.response?.status === 404) {
            toast.error("Cannot update - category no longer exists");
            fetchCategories(); // Refresh the list
            setIsDialogOpen(false);
            return;
          }
          // Rethrow for the outer catch block to handle other errors
          throw categoryError;
        }
      } else {
        await api.post("/admin/categories", formData);
        toast.success("Category created successfully");
      }
      
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error.response?.status === 404) {
        toast.error("Category not found - it may have been deleted");
      } else {
        toast.error(error.response?.data?.message || "Failed to save category");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/categories/${deleteId}`);
      toast.success("Category deleted");
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category", {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const openEditDialog = async (category) => {
    try {
      // Verify the category exists by fetching it first
      const response = await api.get(`/admin/categories/${category._id}`);
      
      if (response.data && response.data.data) {
        const freshCategory = response.data.data;
        setFormData({
          name: freshCategory.name,
          description: freshCategory.description || "",
          isActive: freshCategory.isActive,
          image: freshCategory.image || null
        });
        setEditId(freshCategory._id);
        setIsDialogOpen(true);
      } else {
        toast.error("Category data is invalid");
        fetchCategories(); // Refresh the list
      }
    } catch (error) {
      console.error('Error fetching category for edit:', error);
      if (error.response?.status === 404) {
        toast.error("Category no longer exists");
      } else {
        toast.error("Error loading category", {
          description: error.response?.data?.message || error.message
        });
      }
      fetchCategories(); // Refresh the list
    }
  };

  const openDeleteDialog = (id) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      isActive: true,
      image: null
    });
    setEditId(null);
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading categories...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No categories found. Create your first category!
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        {category.image && category.image.url ? (
                          <img
                            src={category.image.url}
                            alt={category.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        {category.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            category.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(category._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="overflow-y-scroll max-h-screen">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editId
                ? "Update the category details below"
                : "Fill in the details to create a new category"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Category Image</Label>
                <ImageUpload
                  value={formData.image ? [formData.image] : []}
                  onChange={handleImageChange}
                  maxFiles={1}
                  folder="categories"
                />
                <p className="text-xs text-gray-500">
                  Upload a representative image for this category
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={handleSwitchChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editId ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This will also delete all subcategories and products associated with it. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage; 