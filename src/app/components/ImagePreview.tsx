import { X, FileImage } from 'lucide-react'
import { ImageFile } from '../types/customRequest'
import { imageUploadService } from '../services/imageUpload'

interface ImagePreviewProps {
  images: ImageFile[]
  onRemove: (imageId: string) => void
  maxImages?: number
}

export function ImagePreview({ images, onRemove, maxImages = 5 }: ImagePreviewProps) {
  if (images.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">
          Selected Images ({images.length}/{maxImages})
        </p>
        {images.length >= maxImages && (
          <p className="text-xs text-orange-600">
            Maximum images reached
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Image Preview */}
            <div className="aspect-square relative">
              <img
                src={image.preview}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => onRemove(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label={`Remove ${image.name}`}
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
            </div>
            
            {/* Image Info */}
            <div className="p-2 bg-white">
              <p className="text-xs font-medium text-gray-900 truncate" title={image.name}>
                {image.name}
              </p>
              <p className="text-xs text-gray-500">
                {imageUploadService.formatFileSize(image.size)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
