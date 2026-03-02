import { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { CustomRequest } from '../types/customRequest'
import { customRequestStorage } from '../services/customRequestStorage'
import { ImageGallery } from '../components/ImageGallery'
import { ImageLightbox } from '../components/ImageLightbox'
import { downloadImage, downloadImagesAsZip, getZipFileName } from '../utils/downloadHelpers'
import { toast } from 'sonner'

export function CustomerPortal() {
  const [email, setEmail] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [requests, setRequests] = useState<CustomRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [lightboxImages, setLightboxImages] = useState<'reference' | 'result'>('reference')
  const [feedbackText, setFeedbackText] = useState('')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'approve' | 'changes'>('approve')

  useEffect(() => {
    if (isLoggedIn && email) {
      loadRequests()
    }
  }, [isLoggedIn, email])

  const loadRequests = () => {
    const customerRequests = customRequestStorage.getRequestsByCustomer(email)
    setRequests(customerRequests)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsLoggedIn(true)
      toast.success('Đăng nhập thành công!')
    }
  }

  const handleDownloadImage = (imageId: string) => {
    if (!selectedRequest) return
    
    const allImages = lightboxImages === 'reference' 
      ? selectedRequest.images 
      : selectedRequest.resultImages || []
    
    const image = allImages.find(img => img.id === imageId)
    if (!image) {
      toast.error('Image not found')
      return
    }
    
    try {
      downloadImage(image)
      toast.success(`Downloaded ${image.name}`)
    } catch (error) {
      toast.error('Failed to download image')
      console.error(error)
    }
  }

  const handleDownloadAll = async (type: 'reference' | 'result') => {
    if (!selectedRequest) return
    
    const images = type === 'reference' ? selectedRequest.images : selectedRequest.resultImages || []
    
    if (images.length === 0) return
    
    try {
      const zipFileName = getZipFileName(selectedRequest.id)
      await downloadImagesAsZip(images, zipFileName)
      toast.success(`Downloaded ${images.length} images as ZIP`)
    } catch (error) {
      toast.error('Failed to create ZIP file')
      console.error(error)
    }
  }

  const handleOpenFeedback = (type: 'approve' | 'changes') => {
    setFeedbackType(type)
    setFeedbackText('')
    setShowFeedbackModal(true)
  }

  const handleSubmitFeedback = () => {
    if (!selectedRequest) return
    
    if (feedbackType === 'changes' && !feedbackText.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi')
      return
    }

    try {
      const text = feedbackText.trim() || (feedbackType === 'approve' ? 'Khách hàng đã chấp nhận sản phẩm' : '')
      customRequestStorage.addCustomerFeedback(
        selectedRequest.id,
        text,
        feedbackType === 'changes'
      )
      
      loadRequests()
      const updated = customRequestStorage.getRequest(selectedRequest.id)
      setSelectedRequest(updated)
      
      setShowFeedbackModal(false)
      setFeedbackText('')
      
      if (feedbackType === 'approve') {
        toast.success('Đã chấp nhận sản phẩm!')
      } else {
        toast.success('Đã gửi yêu cầu chỉnh sửa!')
      }
    } catch (error) {
      toast.error('Không thể gửi phản hồi')
      console.error(error)
    }
  }

  const getStatusBadge = (status: CustomRequest['status']) => {
    const badges = {
      'Pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, text: 'Chờ xử lý' },
      'In Progress': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package, text: 'Đang xử lý' },
      'Awaiting Approval': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: AlertCircle, text: 'Chờ duyệt' },
      'Approved': { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, text: 'Đã duyệt' },
      'Completed': { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, text: 'Hoàn thành' },
      'Cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, text: 'Đã hủy' }
    }
    
    const badge = badges[status]
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.text}
      </span>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Portal</h2>
          <p className="text-gray-600 mb-6">Nhập email để xem các yêu cầu custom của bạn</p>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="font-medium mb-2 block text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Xem yêu cầu của tôi
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">My Custom Requests</h1>
          <p className="text-gray-600">Logged in as: {email}</p>
        </div>
        <button
          onClick={() => {
            setIsLoggedIn(false)
            setEmail('')
            setRequests([])
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Đăng xuất
        </button>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có yêu cầu nào</h3>
          <p className="text-gray-600">Bạn chưa gửi yêu cầu custom nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{request.theme}</h3>
                  <p className="text-sm text-gray-600">{request.layout} - {request.profile}</p>
                </div>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <ImageIcon className="w-4 h-4" />
                  <span>{request.images.length} ảnh tham khảo</span>
                </div>
                
                {request.resultImages && request.resultImages.length > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>{request.resultImages.length} ảnh sản phẩm</span>
                  </div>
                )}
                
                <div className="text-gray-500 text-xs pt-2">
                  {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              
              {request.status === 'Awaiting Approval' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-purple-700">
                    ⚠️ Cần phản hồi của bạn
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal content - will continue in next message due to length */}
          </div>
        </div>
      )}
    </div>
  )
}
