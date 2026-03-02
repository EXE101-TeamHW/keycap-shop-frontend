import { useState } from 'react'
import { X, Upload, AlertCircle } from 'lucide-react'
import { ImageFile } from '../types/customRequest'
import { imageUploadService } from '../services/imageUpload'
import { ImagePreview } from './ImagePreview'
import { toast } from 'sonner'

interface StaffUploadResultModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (images: ImageFile[], notes: string) => Promise<void>
  requestId: string
}

export function StaffUploadResultModal({
  isOpen,
  onClose,
  onUpload,
  requestId
}: StaffUploadResultModalProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const MAX_RESULT_IMAGES = 10
  const MAX_NOTES_LENGTH = 1000

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const selectedFiles = Array.from(e.target.files)
    
    // Validate files
    const validation = imageUploadService.validateFiles(selectedFiles)
    
    if (!validation.valid) {
      validation.errors.forEach(error => {
        toast.error(error)
      })
      return
    }

    // Check if adding these files would exceed the limit
    if (images.length + selectedFiles.length > MAX_RESULT_IMAGES) {
      toast.error(`Maximum ${MAX_RESULT_IMAGES} images allowed. You currently have ${images.length} image(s).`)
      return
    }

    // Process images
    setIsProcessing(true)
    try {
      const processedImages = await imageUploadService.processImages(selectedFiles)
      setImages(prev => [...prev, ...processedImages])
      toast.success(`${processedImages.length} image(s) added successfully`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process images'
      toast.error(errorMessage)
      console.error('Error processing images:', error)
    } finally {
      setIsProcessing(false)
      e.target.value = ''
    }
  }

  const handleRemoveImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleSubmit = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one result image')
      return
    }

    setIsUploading(true)
    try {
      await onUpload(images, notes)
      toast.success('Result images uploaded successfully!')
      
      // Reset and close
      setImages([])
      setNotes('')
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload result images'
      toast.error(errorMessage)
      console.error('Error uploading result images:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (images.length > 0 && !window.confirm('You have unsaved images. Are you sure you want to close?')) {
      return
    }
    setImages([])
    setNotes('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Upload Custom Result Images</h3>
            <p className="text-sm text-gray-600 mt-1">Upload photos of the finished custom product</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="font-medium mb-2 block text-gray-700">
              Result Images
              <span className="text-sm text-gray-500 ml-2">(Max {MAX_RESULT_IMAGES} images)</span>
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="result-file-upload"
                disabled={isProcessing || isUploading || images.length >= MAX_RESULT_IMAGES}
              />
              <label
                htmlFor="result-file-upload"
                className={`cursor-pointer text-gray-700 font-medium hover:text-gray-900 ${
                  isProcessing || isUploading || images.length >= MAX_RESULT_IMAGES ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? 'Processing images...' : 'Click to upload result images'}
              </label>
              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG, JPEG, WEBP up to 5MB each
              </p>
              
              {images.length >= MAX_RESULT_IMAGES && (
                <div className="mt-3 flex items-center justify-center gap-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Maximum images reached</span>
                </div>
              )}
            </div>

            {/* Image Preview */}
            <ImagePreview 
              images={images} 
              onRemove={handleRemoveImage}
              maxImages={MAX_RESULT_IMAGES}
            />
          </div>

          {/* Staff Notes */}
          <div>
            <label className="font-medium mb-2 block text-gray-700">
              Notes for Customer
              <span className="text-sm text-gray-500 ml-2">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={MAX_NOTES_LENGTH}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
              placeholder="Add any notes about the custom work, materials used, special features, etc."
              disabled={isUploading}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Explain the custom work to help the customer understand the result
              </p>
              <p className={`text-xs ${notes.length > MAX_NOTES_LENGTH * 0.9 ? 'text-orange-600' : 'text-gray-500'}`}>
                {notes.length} / {MAX_NOTES_LENGTH}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isUploading || isProcessing || images.length === 0}
              className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : `Upload ${images.length} Image${images.length !== 1 ? 's' : ''}`}
            </button>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
