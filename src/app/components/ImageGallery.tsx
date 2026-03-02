import { Download, ImageIcon, Package } from 'lucide-react'
import { ImageFile } from '../types/customRequest'

interface ImageGalleryProps {
  images: ImageFile[]
  requestId: string
  onImageClick?: (index: number) => void
  onDownload?: (imageId: string) => void
  onDownloadAll?: () => void
}

export function ImageGallery({
  images,
  requestId,
  onImageClick,
  onDownload,
  onDownloadAll
}: ImageGalleryProps) {
  // Show placeholder when no images
  if (images.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600 font-medium">No reference images uploaded</p>
        <p className="text-sm text-gray-500 mt-1">
          Customer did not provide any reference images for this request
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header with download all button */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700">
          Reference Images ({images.length})
        </h4>
        {images.length > 1 && onDownloadAll && (
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Package className="w-4 h-4" />
            Download All (ZIP)
          </button>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:border-gray-400 transition-all"
          >
            {/* Thumbnail */}
            <div
              className="aspect-square relative cursor-pointer"
              onClick={() => onImageClick?.(index)}
            >
              <img
                src={image.preview}
                alt={image.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Image Info and Download Button */}
            <div className="p-2 bg-white flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate" title={image.name}>
                  {image.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(image.size / 1024).toFixed(0)} KB
                </p>
              </div>
              
              {onDownload && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDownload(image.id)
                  }}
                  className="flex-shrink-0 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  aria-label={`Download ${image.name}`}
                  title="Download image"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
