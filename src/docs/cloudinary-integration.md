# Cloudinary Integration Guide

This document explains how to use the Cloudinary image upload functionality in the Admin Dashboard.

## Setup

1. You need to have a Cloudinary account. Sign up at [Cloudinary](https://cloudinary.com/) if you don't have one.

2. In your Cloudinary dashboard, locate your Cloud Name, API Key, and API Secret.

3. Add these credentials to your backend `.env` file:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## How It Works

The integration allows direct uploading to Cloudinary from the client side. Here's how it works:

1. When you upload an image in the product form, the file is sent to our backend API
2. The backend uploads the image to Cloudinary and returns the image URL and ID
3. These details are stored with the product in the database
4. When displaying products, images are served directly from Cloudinary's CDN

## Components

We provide two React components for image uploads:

1. **ImageUpload**: A standalone component for direct Cloudinary uploads
   - Location: `src/components/ui/ImageUpload.jsx`
   - Use this when you need a simple image uploader in any form

2. **CloudinaryUploader**: A more advanced component for handling multiple images with preview
   - Location: `src/components/ui/CloudinaryUploader.jsx`
   - Use this for more complex scenarios with multiple image handling

## Usage Example

```jsx
import ImageUpload from "@/components/ui/ImageUpload";

function MyForm() {
  const [images, setImages] = useState([]);
  
  return (
    <div>
      <ImageUpload
        value={images}
        onChange={setImages}
        maxFiles={5}
        folder="products"
      />
      
      {/* The rest of your form */}
    </div>
  );
}
```

## Image Transformation

Cloudinary allows you to transform images on-the-fly using URL parameters. Some examples:

1. Resize an image to 300x300 pixels:
   ```
   https://res.cloudinary.com/your-cloud-name/image/upload/w_300,h_300/your-image-id
   ```

2. Crop an image to a specific aspect ratio:
   ```
   https://res.cloudinary.com/your-cloud-name/image/upload/c_crop,ar_16:9/your-image-id
   ```

3. Apply automatic quality optimization:
   ```
   https://res.cloudinary.com/your-cloud-name/image/upload/q_auto/your-image-id
   ```

See [Cloudinary documentation](https://cloudinary.com/documentation/image_transformations) for more details.

## Troubleshooting

- **Upload Failing**: Check your Cloudinary credentials in the `.env` file
- **Image Not Displaying**: Verify the URL returned from Cloudinary is correct
- **Size Limitations**: By default, uploads are limited to 5MB per file
- **Format Issues**: Only image files are accepted (JPEG, PNG, GIF, WebP, etc.)

## Security Considerations

- Backend authentication is required for all upload operations
- Direct uploads are protected by rate limiting
- All uploads are validated for file type and size 