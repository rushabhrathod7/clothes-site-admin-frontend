import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  StarHalf, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { API_URL } from '@/config';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const ReviewsPage = () => {
  const { token } = useAuthStore();
  const searchInputRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    rating: 'all',
    sort: '-createdAt'
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [editReview, setEditReview] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchValue }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    fetchReviews();
  }, [page, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [
            key,
            value === 'all' ? '' : value
          ])
        )
      });

      const response = await fetch(`${API_URL}/admin/reviews?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch reviews');
      }

      setReviews(data.reviews);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update review status');
      }

      // Update the review in the local state
      setReviews(reviews.map(review => 
        review._id === reviewId ? { ...review, status: newStatus } : review
      ));

      toast.success('Review status updated successfully');
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error(error.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete review');
      }

      // Remove the review from the local state
      setReviews(reviews.filter(review => review._id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.message);
    }
  };

  // Handle view review
  const handleViewReview = async (reviewId) => {
    try {
      const response = await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch review details');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch review details');
      }

      setSelectedReview(data.data);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching review:', error);
      toast.error(error.message || 'Failed to fetch review details');
    }
  };

  // Handle edit review
  const handleEditClick = async (reviewId) => {
    try {
      const response = await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch review details for editing');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch review details for editing');
      }

      setEditReview(data.data);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error('Error fetching review for edit:', error);
      toast.error(error.message || 'Failed to fetch review details for editing');
    }
  };

  // Handle update review
  const handleUpdateReview = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/admin/reviews/${editReview._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: editReview.rating,
          title: editReview.title,
          comment: editReview.comment,
          status: editReview.status || 'approved'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update review');
      }

      toast.success('Review updated successfully');
      setIsEditDialogOpen(false);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error(error.message || 'Failed to update review');
    }
  };

  // Handle delete review
  const handleDeleteClick = (reviewId) => {
    setDeleteReviewId(reviewId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/reviews/${deleteReviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete review');
      }

      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Failed to delete review');
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteReviewId(null);
    }
  };

  // Render star rating
  const renderStarRating = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= Math.floor(rating) ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : star - 0.5 <= rating ? (
              <StarHalf className="h-4 w-4 text-yellow-400" />
            ) : (
              <Star className="h-4 w-4 text-muted-foreground/30" />
            )}
          </span>
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && !reviews.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900 dark:text-gray-100" />
      </div>
    );
  }

  if (error && !reviews.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={fetchReviews}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reviews Management</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            ref={searchInputRef}
            placeholder="Search reviews..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.rating}
          onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
        >
          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[1, 2, 3, 4, 5].map(rating => (
              <SelectItem key={rating} value={rating.toString()}>
                {rating} Stars
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.sort}
          onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}
        >
          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-createdAt">Newest First</SelectItem>
            <SelectItem value="createdAt">Oldest First</SelectItem>
            <SelectItem value="-rating">Highest Rating</SelectItem>
            <SelectItem value="rating">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900">
              <TableHead className="text-gray-900 dark:text-gray-100">Product</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">User</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Rating</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Review</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Date</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {review.product?.image && (
                      <img
                        src={review.product.image}
                        alt={review.product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <span className="text-gray-900 dark:text-gray-100">{review.product?.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {review.user?.image && (
                      <img
                        src={review.user.image}
                        alt={review.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-gray-900 dark:text-gray-100">{review.user?.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {renderStarRating(review.rating)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{review.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{review.comment}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[review.status]}>
                    {review.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-gray-100">
                  {formatDate(review.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Select
                      value={review.status}
                      onValueChange={(value) => handleStatusChange(review._id, value)}
                    >
                      <SelectTrigger className="w-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approve</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        <Button
          variant="outline"
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="border-gray-200 dark:border-gray-700"
        >
          Previous
        </Button>
        <span className="py-2 px-4 text-gray-900 dark:text-gray-100">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="border-gray-200 dark:border-gray-700"
        >
          Next
        </Button>
      </div>

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Review Details</DialogTitle>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Product</h3>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedReview.product?.name || 'Unknown Product'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User</h3>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedReview.user?.image} alt={selectedReview.user?.name || 'User'} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        {(selectedReview.user?.name?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900 dark:text-gray-100">{selectedReview.user?.name || 'Anonymous User'}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rating</h3>
                  <div className="flex items-center">
                    {renderStarRating(selectedReview.rating)}
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedReview.rating}/5</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date</h3>
                  <p className="text-gray-900 dark:text-gray-100">{formatDate(selectedReview.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Title</h3>
                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedReview.title || 'No Title'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Comment</h3>
                <p className="whitespace-pre-line text-gray-900 dark:text-gray-100">{selectedReview.comment || 'No comment provided.'}</p>
              </div>
              
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReview.images.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={typeof image === 'string' ? image : image.url}
                          alt={`Review ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-gray-200 dark:border-gray-700">
              Close
            </Button>
            {selectedReview && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditClick(selectedReview._id);
                  }}
                  className="border-gray-200 dark:border-gray-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleDeleteClick(selectedReview._id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Review</DialogTitle>
          </DialogHeader>
          
          {editReview && (
            <form onSubmit={handleUpdateReview} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rating" className="text-gray-900 dark:text-gray-100">Rating</Label>
                <Select 
                  value={String(editReview.rating)} 
                  onValueChange={(value) => setEditReview({...editReview, rating: Number(value)})}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-900 dark:text-gray-100">Title</Label>
                <Input
                  id="title"
                  value={editReview.title || ''}
                  onChange={(e) => setEditReview({...editReview, title: e.target.value})}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-gray-900 dark:text-gray-100">Comment</Label>
                <Textarea
                  id="comment"
                  rows={5}
                  value={editReview.comment || ''}
                  onChange={(e) => setEditReview({...editReview, comment: e.target.value})}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-900 dark:text-gray-100">Status</Label>
                <Select 
                  value={editReview.status || 'approved'} 
                  onValueChange={(value) => setEditReview({...editReview, status: value})}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-gray-200 dark:border-gray-700">
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Delete Review</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)} className="border-gray-200 dark:border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReviewsPage;
