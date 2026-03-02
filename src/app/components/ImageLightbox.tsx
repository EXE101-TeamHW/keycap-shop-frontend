import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { ImageFile } from '../types/customRequest'

interface ImageLightboxProps {
  images: ImageFile[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  onDownload?: (imageId: string) => void
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onDownload
}: ImageLightboxProps) {
  const currentImage = images[currentIndex]
  const hasMultipleImages = images.length > 1

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle arrow keys for navigation
  useEffect(() => {
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (!isOpen || !hasMultipleImages) return

      if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious()
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleArrowKeys)
    }

    return () => {
      document.removeEventListener('keydown', handleArrowKeys)
    }
  }, [isOpen, hasMultipleImages, onNext, onPrevious])

  if (!isOpen || !currentImage) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className="absolute top-4 left-4 text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1.5 rounded-lg">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Download Button */}
      {onDownload && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDownload(currentImage.id)
          }}
          className="absolute top-4 right-16 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Download image"
          title="Download image"
        >
          <Download className="w-6 h-6" />
        </button>
      )}

      {/* Previous Button */}
      {hasMultipleImages && onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrevious()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next Button */}
      {hasMultipleImages && onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Main Image */}
      <div
        className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.base64}
          alt={currentImage.name}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Image Info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded-lg max-w-md">
        <p className="font-medium truncate">{currentImage.name}</p>
        <p className="text-sm text-gray-300">
          {(currentImage.size / 1024).toFixed(0)} KB
        </p>
      </div>
    </div>
  )
}
