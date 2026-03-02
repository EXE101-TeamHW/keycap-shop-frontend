# Requirements Document

## Introduction

Hệ thống Custom Service hiện tại cho phép khách hàng gửi yêu cầu thiết kế bàn phím tùy chỉnh, nhưng chức năng upload ảnh tham khảo chưa hoạt động đầy đủ. Tính năng này sẽ cho phép khách hàng upload ảnh tham khảo khi gửi yêu cầu, lưu trữ ảnh trên server, và hiển thị ảnh đó cho nhân viên trong Staff Dashboard để họ có thể xem và xử lý yêu cầu một cách hiệu quả.

## Glossary

- **Customer**: Người dùng cuối gửi yêu cầu thiết kế bàn phím tùy chỉnh
- **Staff**: Nhân viên xử lý các yêu cầu custom từ khách hàng
- **Custom Request**: Yêu cầu thiết kế bàn phím tùy chỉnh từ khách hàng
- **Reference Image**: Ảnh tham khảo mà khách hàng upload để minh họa ý tưởng thiết kế
- **Image Storage Service**: Dịch vụ lưu trữ ảnh (có thể là local storage, cloud storage như Cloudinary, AWS S3)
- **Custom Service Page**: Trang web nơi khách hàng gửi yêu cầu custom
- **Staff Dashboard**: Trang quản lý dành cho nhân viên để xem và xử lý các yêu cầu

## Requirements

### Requirement 1

**User Story:** As a customer, I want to upload reference images when submitting a custom keyboard request, so that the staff can understand my design vision clearly.

#### Acceptance Criteria

1. WHEN a customer selects image files from their device THEN the system SHALL display a preview of selected images before submission
2. WHEN a customer submits the custom request form with images THEN the system SHALL upload all selected images to the storage service
3. WHEN image upload is in progress THEN the system SHALL display a loading indicator to inform the customer
4. WHEN image upload fails THEN the system SHALL display an error message and allow the customer to retry
5. WHEN image upload succeeds THEN the system SHALL store the image URLs with the custom request data

### Requirement 2

**User Story:** As a customer, I want to upload multiple images in common formats, so that I can provide comprehensive visual references for my design.

#### Acceptance Criteria

1. WHEN a customer selects files for upload THEN the system SHALL accept image files in PNG, JPG, JPEG, and WEBP formats
2. WHEN a customer selects a file larger than 5MB THEN the system SHALL reject the file and display a size limit error message
3. WHEN a customer selects more than 5 images THEN the system SHALL reject additional files and display a quantity limit message
4. WHEN a customer uploads valid images THEN the system SHALL preserve the original image quality during upload
5. WHEN a customer removes a selected image before submission THEN the system SHALL remove it from the upload queue

### Requirement 3

**User Story:** As a staff member, I want to view all custom requests with their reference images, so that I can understand customer requirements and process requests efficiently.

#### Acceptance Criteria

1. WHEN a staff member views the custom requests list THEN the system SHALL display all requests including those with reference images
2. WHEN a staff member clicks on a custom request THEN the system SHALL display the request details including all uploaded reference images
3. WHEN a staff member views reference images THEN the system SHALL display images in a gallery format with thumbnail previews
4. WHEN a staff member clicks on a thumbnail image THEN the system SHALL display the full-size image in a modal or lightbox
5. WHEN a custom request has no images THEN the system SHALL display a placeholder or message indicating no images were uploaded

### Requirement 4

**User Story:** As a staff member, I want to download reference images from custom requests, so that I can use them in design software or share with the production team.

#### Acceptance Criteria

1. WHEN a staff member views a reference image THEN the system SHALL provide a download button for that image
2. WHEN a staff member clicks the download button THEN the system SHALL download the image to their device with the original filename
3. WHEN a staff member views multiple images THEN the system SHALL provide an option to download all images as a ZIP file
4. WHEN the download all option is selected THEN the system SHALL create a ZIP file containing all reference images with descriptive filenames
5. WHEN download fails THEN the system SHALL display an error message and allow retry

### Requirement 5

**User Story:** As a system administrator, I want uploaded images to be stored securely and efficiently, so that the system remains performant and data is protected.

#### Acceptance Criteria

1. WHEN an image is uploaded THEN the system SHALL generate a unique filename to prevent naming conflicts
2. WHEN an image is stored THEN the system SHALL organize images by custom request ID for easy retrieval
3. WHEN an image is uploaded THEN the system SHALL validate the file type to prevent malicious file uploads
4. WHEN storage space is limited THEN the system SHALL implement image compression to reduce file sizes while maintaining acceptable quality
5. WHEN a custom request is deleted THEN the system SHALL remove associated images from storage to free up space

### Requirement 6

**User Story:** As a customer, I want immediate feedback on my image uploads, so that I know whether my images were successfully attached to my request.

#### Acceptance Criteria

1. WHEN image upload completes successfully THEN the system SHALL display a success message with the number of images uploaded
2. WHEN the custom request is submitted successfully THEN the system SHALL confirm that images were included in the submission
3. WHEN an image fails to upload THEN the system SHALL display which specific image failed and the reason
4. WHEN all images fail to upload THEN the system SHALL prevent form submission and prompt the customer to resolve the issue
5. WHEN the customer navigates away during upload THEN the system SHALL warn them that upload is in progress
