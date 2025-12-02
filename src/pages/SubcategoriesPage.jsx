import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ui/ImageUpload";
import api from "@/services/api";

const SubcategoriesPage = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isActive: true,
    image: null
  });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Load subcategories and categories on component mount
  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/subcategories");
      setSubcategories(response.data.data);
    } catch (error) {
      toast.error("Failed to load subcategories", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.get("/admin/categories");
      setCategories(response.data.data);
    } catch (error) {
      toast.error("Failed to load categories", {
        description: error.message,
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
    
    // Take the first image since subcategories only need one image
    const image = images[0];
    console.log('Setting new image:', image);
    setFormData(prev => ({ ...prev, image }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form with data:', formData);
      
      if (editId) {
        await api.put(`/admin/subcategories/${editId}`, formData);
        toast.success("Subcategory updated successfully");
      } else {
        await api.post("/admin/subcategories", formData);
        toast.success("Subcategory created successfully");
      }
      
      setIsDialogOpen(false);
      fetchSubcategories();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || "Failed to save subcategory");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/subcategories/${deleteId}`);
      toast.success("Subcategory deleted");
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
      fetchSubcategories();
    } catch (error) {
      toast.error("Failed to delete subcategory", {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const openEditDialog = async (subcategory) => {
    try {
      // Verify the subcategory exists by fetching it first
      const response = await api.get(`/admin/subcategories/${subcategory._id}`);
      
      if (response.data && response.data.data) {
        const freshSubcategory = response.data.data;
        setFormData({
          name: freshSubcategory.name,
          description: freshSubcategory.description || "",
          category: freshSubcategory.category._id,
          isActive: freshSubcategory.isActive,
          image: freshSubcategory.image || null
        });
        setEditId(freshSubcategory._id);
        setIsDialogOpen(true);
      } else {
        toast.error("Subcategory data is invalid");
        fetchSubcategories(); // Refresh the list
      }
    } catch (error) {
      console.error('Error fetching subcategory for edit:', error);
      if (error.response?.status === 404) {
        toast.error("Subcategory no longer exists");
      } else {
        toast.error("Error loading subcategory", {
          description: error.response?.data?.message || error.message
        });
      }
      fetchSubcategories(); // Refresh the list
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
      category: "",
      isActive: true,
      image: null
    });
    setEditId(null);
  };

  // Find category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c._id === categoryId);
    return category ? category.name : "Unknown";
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subcategories</h1>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          disabled={categories.length === 0}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subcategory
        </Button>
      </div>

      {categories.length === 0 && !categoriesLoading && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          <p className="font-semibold">No categories found</p>
          <p className="text-sm">
            You need to create at least one category before adding subcategories.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Subcategories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading subcategories...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No subcategories found. Create your first subcategory!
                    </TableCell>
                  </TableRow>
                ) : (
                  subcategories.map((subcategory) => (
                    <TableRow key={subcategory._id}>
                      <TableCell>
                        {subcategory.image && subcategory.image.url ? (
                          <img
                            src={subcategory.image.url}
                            alt={subcategory.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {subcategory.name}
                      </TableCell>
                      <TableCell>
                        {subcategory.category?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {subcategory.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            subcategory.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {subcategory.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(subcategory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(subcategory._id)}
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

      {/* Subcategory Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Subcategory" : "Add New Subcategory"}
            </DialogTitle>
            <DialogDescription>
              {editId
                ? "Update the subcategory details below"
                : "Fill in the details to create a new subcategory"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Parent Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Label htmlFor="image">Subcategory Image</Label>
                <ImageUpload
                  value={formData.image ? [formData.image] : []}
                  onChange={handleImageChange}
                  maxFiles={1}
                  folder="subcategories"
                />
                <p className="text-xs text-gray-500">
                  Upload a representative image for this subcategory
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
                {editId ? "Update Subcategory" : "Create Subcategory"}
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
              Are you sure you want to delete this subcategory? This will also delete all products associated with it. This action cannot be undone.
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

export default SubcategoriesPage; 