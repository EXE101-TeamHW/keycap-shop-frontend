# Implementation Plan: Custom Service Image Upload

- [x] 1. Set up testing infrastructure


  - Install fast-check library for property-based testing
  - Configure Vitest for the project if not already set up
  - Create test utilities and helpers for image generation
  - _Requirements: All (testing foundation)_

- [x] 2. Implement Image Upload Service


  - Create `src/app/services/imageUpload.ts` with core functionality
  - Implement file validation (type, size, quantity)
  - Implement base64 conversion with FileReader API
  - Implement preview URL generation
  - Add error handling for all operations
  - _Requirements: 1.1, 1.2, 1.5, 2.1, 2.2, 2.3, 2.4_

- [ ]* 2.1 Write property test for file format validation
  - **Property 5: File format validation**
  - **Validates: Requirements 2.1**

- [ ]* 2.2 Write property test for base64 round-trip
  - **Property 6: Base64 conversion preserves data**
  - **Validates: Requirements 2.4**

- [ ]* 2.3 Write unit tests for image upload service
  - Test file size validation with boundary values
  - Test quantity validation with boundary values
  - Test error handling for invalid inputs
  - _Requirements: 2.2, 2.3_

- [x] 3. Implement Custom Request Storage Service


  - Create `src/app/services/customRequestStorage.ts`
  - Implement saveRequest function with UUID generation
  - Implement getRequest and getAllRequests functions
  - Implement updateRequestStatus function
  - Implement deleteRequest with cascade image deletion
  - Add localStorage error handling (quota exceeded)
  - _Requirements: 1.5, 3.1, 3.2, 5.1, 5.2, 5.5_

- [ ]* 3.1 Write property test for request retrieval completeness
  - **Property 8: Request retrieval completeness**
  - **Validates: Requirements 3.1**

- [ ]* 3.2 Write property test for unique image identifiers
  - **Property 16: Unique image identifiers**
  - **Validates: Requirements 5.1**

- [ ]* 3.3 Write property test for cascade deletion
  - **Property 19: Cascade deletion**
  - **Validates: Requirements 5.5**

- [ ]* 3.4 Write unit tests for storage service
  - Test saving requests with and without images
  - Test updating request status
  - Test localStorage quota handling
  - _Requirements: 1.5, 3.1, 5.5_

- [x] 4. Create ImagePreview Component


  - Create `src/app/components/ImagePreview.tsx`
  - Implement thumbnail grid layout
  - Add remove button for each image
  - Display image name and size
  - Show max images indicator
  - _Requirements: 1.1, 2.5_

- [ ]* 4.1 Write property test for image removal from queue
  - **Property 7: Image removal from queue**
  - **Validates: Requirements 2.5**

- [ ]* 4.2 Write unit tests for ImagePreview component
  - Test rendering with various image counts
  - Test remove button functionality
  - _Requirements: 1.1, 2.5_

- [x] 5. Create ImageGallery Component


  - Create `src/app/components/ImageGallery.tsx`
  - Implement grid layout for thumbnails
  - Add click handler to open lightbox
  - Show placeholder when no images
  - Add download button for each image
  - Add download all button for multiple images
  - _Requirements: 3.3, 3.5, 4.1, 4.3_

- [ ]* 5.1 Write property test for gallery rendering
  - **Property 10: Gallery rendering**
  - **Validates: Requirements 3.3**

- [ ]* 5.2 Write unit tests for ImageGallery component
  - Test rendering with 0, 1, and 5 images
  - Test download button presence
  - _Requirements: 3.3, 3.5, 4.1_

- [x] 6. Create ImageLightbox Component


  - Create `src/app/components/ImageLightbox.tsx`
  - Implement modal overlay with full-size image display
  - Add navigation buttons (previous/next)
  - Add download button
  - Add close button and ESC key handler
  - Add backdrop click to close
  - _Requirements: 3.4, 4.2_

- [ ]* 6.1 Write property test for lightbox interaction
  - **Property 11: Lightbox interaction**
  - **Validates: Requirements 3.4**

- [ ]* 6.2 Write unit tests for ImageLightbox component
  - Test navigation between images
  - Test close functionality
  - Test download functionality
  - _Requirements: 3.4, 4.2_

- [x] 7. Update CustomService Page - Add Image Upload UI


  - Update `src/app/pages/CustomService.tsx`
  - Replace file input with enhanced upload area
  - Integrate ImagePreview component
  - Add image state management (selected images array)
  - Implement file selection handler with validation
  - Add loading state during image processing
  - Show validation errors (size, type, quantity)
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 2.5_

- [ ]* 7.1 Write property test for image preview display
  - **Property 1: Image preview display**
  - **Validates: Requirements 1.1**

- [ ]* 7.2 Write property test for loading state during upload
  - **Property 3: Loading state during upload**
  - **Validates: Requirements 1.3**

- [x] 8. Update CustomService Page - Integrate Storage Service


  - Import and use imageUpload service
  - Import and use customRequestStorage service
  - Update form submit handler to process images
  - Convert selected files to ImageFile objects
  - Save custom request with images to localStorage
  - Show success message with image count
  - Handle upload errors and display error messages
  - Add navigation guard during upload
  - _Requirements: 1.2, 1.4, 1.5, 6.1, 6.2, 6.3, 6.5_

- [ ]* 8.1 Write property test for complete image upload
  - **Property 2: Complete image upload**
  - **Validates: Requirements 1.2**

- [ ]* 8.2 Write property test for image data persistence
  - **Property 4: Image data persistence**
  - **Validates: Requirements 1.5**

- [ ]* 8.3 Write property test for success message accuracy
  - **Property 20: Success message accuracy**
  - **Validates: Requirements 6.1**

- [ ]* 8.4 Write property test for navigation warning
  - **Property 22: Navigation warning during upload**
  - **Validates: Requirements 6.5**

- [ ]* 8.5 Write unit tests for form submission with images
  - Test successful submission flow
  - Test error handling scenarios
  - _Requirements: 1.2, 1.4, 1.5_

- [x] 9. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Update StaffDashboard - Display Custom Requests


  - Update `src/app/pages/StaffDashboard.tsx`
  - Replace mock orders with data from customRequestStorage
  - Update orders state to use CustomRequest type
  - Add image count indicator in requests table
  - Update order detail modal to show images
  - _Requirements: 3.1, 3.2_

- [ ]* 10.1 Write property test for request detail display
  - **Property 9: Request detail display**
  - **Validates: Requirements 3.2**

- [x] 11. Update StaffDashboard - Integrate ImageGallery


  - Import and use ImageGallery component in order detail modal
  - Pass images array to ImageGallery
  - Implement download handler for single images
  - Implement download all handler for multiple images
  - Add ZIP creation functionality using JSZip library
  - _Requirements: 3.3, 4.1, 4.2, 4.3, 4.4_

- [ ]* 11.1 Write property test for download button presence
  - **Property 12: Download button presence**
  - **Validates: Requirements 4.1**

- [ ]* 11.2 Write property test for download functionality
  - **Property 13: Download functionality**
  - **Validates: Requirements 4.2**

- [ ]* 11.3 Write property test for batch download availability
  - **Property 14: Batch download availability**
  - **Validates: Requirements 4.3**

- [ ]* 11.4 Write property test for ZIP file completeness
  - **Property 15: ZIP file completeness**
  - **Validates: Requirements 4.4**

- [x] 12. Update StaffDashboard - Integrate ImageLightbox


  - Import and use ImageLightbox component
  - Add lightbox state management (open/closed, current index)
  - Connect gallery thumbnail clicks to lightbox
  - Implement lightbox navigation
  - Connect download button in lightbox
  - _Requirements: 3.4, 4.2_

- [x] 13. Add Download Utilities

  - Create `src/app/utils/downloadHelpers.ts`
  - Implement single image download function
  - Install and configure JSZip library
  - Implement ZIP creation and download function
  - Add error handling for download failures
  - _Requirements: 4.2, 4.4, 4.5_

- [ ]* 13.1 Write unit tests for download utilities
  - Test single image download
  - Test ZIP creation with multiple images
  - Test error handling
  - _Requirements: 4.2, 4.4, 4.5_

- [x] 14. Implement Error Handling and User Feedback


  - Add toast notification system (using sonner which is already installed)
  - Implement error messages for all validation failures
  - Add success messages for uploads and downloads
  - Implement storage quota warning
  - Add error recovery UI (retry buttons)
  - _Requirements: 1.4, 2.2, 2.3, 4.5, 6.3, 6.4_

- [ ]* 14.1 Write unit tests for error handling
  - Test validation error messages
  - Test storage quota handling
  - Test retry functionality
  - _Requirements: 1.4, 4.5, 6.3_

- [x] 15. Add TypeScript Types and Interfaces

  - Create `src/app/types/customRequest.ts`
  - Define ImageFile interface
  - Define CustomRequest interface
  - Define ValidationResult interface
  - Export all types for use across components
  - _Requirements: All (type safety)_

- [x] 16. Implement Security Validations

  - Add MIME type validation in imageUpload service
  - Add file extension validation as secondary check
  - Implement file content validation (magic numbers)
  - Add XSS prevention for user inputs
  - _Requirements: 5.3_

- [ ]* 16.1 Write property test for file type security validation
  - **Property 18: File type security validation**
  - **Validates: Requirements 5.3**

- [x] 17. Add Performance Optimizations

  - Implement lazy loading for ImageGallery
  - Add loading skeletons for images
  - Optimize base64 conversion with async processing
  - Add image caching to avoid re-conversion
  - _Requirements: Performance (non-functional)_

- [x] 18. Final Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Manual Testing and Polish



  - Test complete flow: upload → submit → view → download
  - Test with various image formats and sizes
  - Test error scenarios (oversized files, invalid formats, storage quota)
  - Test on different browsers (Chrome, Firefox, Edge)
  - Verify responsive design on mobile devices
  - Polish UI/UX based on testing feedback
  - _Requirements: All_
