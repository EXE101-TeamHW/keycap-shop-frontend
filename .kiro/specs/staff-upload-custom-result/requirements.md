# Requirements Document: Staff Upload Custom Result Images

## Introduction

Sau khi nhận yêu cầu custom từ khách hàng, staff cần có khả năng upload ảnh sản phẩm đã custom xong để gửi lại cho khách hàng xem và phê duyệt. Tính năng này bổ sung vào luồng custom service hiện tại, tạo thành một quy trình hai chiều hoàn chỉnh.

## Glossary

- **Custom Result Images**: Ảnh sản phẩm đã được custom xong bởi staff
- **Staff**: Nhân viên xử lý yêu cầu custom
- **Customer**: Khách hàng gửi yêu cầu custom
- **Request Status**: Trạng thái của yêu cầu custom
- **Customer Portal**: Trang web nơi khách hàng xem kết quả custom

## Requirements

### Requirement 1

**User Story:** As a staff member, I want to upload custom result images to a request, so that customers can see the finished product.

#### Acceptance Criteria

1. WHEN a staff member views a custom request in "In Progress" status THEN the system SHALL display an option to upload result images
2. WHEN a staff member uploads result images THEN the system SHALL validate file type and size similar to customer uploads
3. WHEN result images are uploaded successfully THEN the system SHALL store them separately from reference images
4. WHEN result images are uploaded THEN the system SHALL automatically change request status to "Awaiting Approval"
5. WHEN a staff member uploads result images THEN the system SHALL allow uploading up to 10 images

### Requirement 2

**User Story:** As a staff member, I want to add notes when uploading result images, so that I can explain the custom work to the customer.

#### Acceptance Criteria

1. WHEN uploading result images THEN the system SHALL provide a text field for staff notes
2. WHEN staff notes are provided THEN the system SHALL store them with the request
3. WHEN staff notes exceed 1000 characters THEN the system SHALL display a character count warning
4. WHEN result images are uploaded without notes THEN the system SHALL allow submission
5. WHEN staff notes are saved THEN the system SHALL display them in the customer portal

### Requirement 3

**User Story:** As a customer, I want to view the custom result images, so that I can see if the product meets my expectations.

#### Acceptance Criteria

1. WHEN a customer views their request with status "Awaiting Approval" THEN the system SHALL display the result images
2. WHEN result images are displayed THEN the system SHALL show them in a gallery format similar to reference images
3. WHEN a customer clicks on a result image THEN the system SHALL open it in a lightbox for detailed viewing
4. WHEN viewing result images THEN the system SHALL display staff notes if provided
5. WHEN a customer views result images THEN the system SHALL provide options to approve or request changes

### Requirement 4

**User Story:** As a customer, I want to approve or request changes to the custom result, so that I can ensure the product meets my requirements.

#### Acceptance Criteria

1. WHEN a customer views result images THEN the system SHALL display "Approve" and "Request Changes" buttons
2. WHEN a customer clicks "Approve" THEN the system SHALL change request status to "Approved"
3. WHEN a customer clicks "Request Changes" THEN the system SHALL prompt for feedback text
4. WHEN customer provides change feedback THEN the system SHALL change request status back to "In Progress"
5. WHEN customer feedback is submitted THEN the system SHALL notify staff of the requested changes

### Requirement 5

**User Story:** As a staff member, I want to see customer feedback on result images, so that I can make necessary adjustments.

#### Acceptance Criteria

1. WHEN a customer requests changes THEN the system SHALL display the feedback in the staff dashboard
2. WHEN viewing a request with change feedback THEN the system SHALL highlight it visually
3. WHEN staff views change feedback THEN the system SHALL display the original result images for reference
4. WHEN staff uploads new result images after changes THEN the system SHALL keep history of previous versions
5. WHEN multiple revision rounds occur THEN the system SHALL track the revision count

### Requirement 6

**User Story:** As a staff member, I want to mark a request as completed after customer approval, so that the workflow is finalized.

#### Acceptance Criteria

1. WHEN a request status is "Approved" THEN the system SHALL allow staff to mark it as "Completed"
2. WHEN marking as "Completed" THEN the system SHALL prompt for final delivery notes
3. WHEN a request is marked "Completed" THEN the system SHALL prevent further status changes
4. WHEN a request is "Completed" THEN the system SHALL display completion date
5. WHEN viewing completed requests THEN the system SHALL show all images (reference and result) in read-only mode

### Requirement 7

**User Story:** As a customer, I want to receive notifications about my custom request status, so that I stay informed about progress.

#### Acceptance Criteria

1. WHEN staff uploads result images THEN the system SHALL display a notification indicator for the customer
2. WHEN a customer logs in THEN the system SHALL show pending notifications for their requests
3. WHEN a request status changes THEN the system SHALL update the notification count
4. WHEN a customer views a notification THEN the system SHALL mark it as read
5. WHEN multiple requests have updates THEN the system SHALL list all notifications chronologically

### Requirement 8

**User Story:** As a system administrator, I want to track the complete history of a custom request, so that I can review the entire workflow.

#### Acceptance Criteria

1. WHEN viewing a request THEN the system SHALL display a timeline of all status changes
2. WHEN images are uploaded (reference or result) THEN the system SHALL record the timestamp and uploader
3. WHEN feedback is provided THEN the system SHALL record it in the timeline
4. WHEN viewing timeline THEN the system SHALL display events in chronological order
5. WHEN exporting request data THEN the system SHALL include the complete history
