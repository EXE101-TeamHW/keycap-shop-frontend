# Testing Guide: Custom Service Image Upload

## Manual Testing Checklist

### Customer Flow (Custom Service Page)

1. **Navigate to Custom Service Page**
   - Open the application
   - Navigate to `/custom-service` route
   - Verify page loads correctly

2. **Test Image Upload - Valid Cases**
   - [ ] Select 1 image (PNG, JPG, JPEG, or WEBP)
   - [ ] Verify image preview appears
   - [ ] Select multiple images (up to 5)
   - [ ] Verify all previews appear
   - [ ] Remove an image using the X button
   - [ ] Verify image is removed from preview

3. **Test Image Upload - Validation**
   - [ ] Try to upload a file > 5MB
   - [ ] Verify error message appears
   - [ ] Try to upload more than 5 images
   - [ ] Verify error message appears
   - [ ] Try to upload invalid file type (PDF, TXT, etc.)
   - [ ] Verify error message appears

4. **Test Form Submission**
   - [ ] Fill out all required fields
   - [ ] Add 2-3 images
   - [ ] Submit the form
   - [ ] Verify loading state appears
   - [ ] Verify success message shows image count
   - [ ] Verify redirect to home page after 3 seconds

5. **Test Navigation Guard**
   - [ ] Start uploading images
   - [ ] Try to navigate away or close tab
   - [ ] Verify warning message appears

### Staff Flow (Staff Dashboard)

1. **Navigate to Staff Dashboard**
   - Open the application
   - Navigate to `/staff` route
   - Verify dashboard loads correctly

2. **View Custom Requests**
   - [ ] Verify stats show correct counts
   - [ ] Verify requests table displays all submitted requests
   - [ ] Verify image count indicator shows for requests with images
   - [ ] Click on a request to view details
   - [ ] Verify all request information is displayed

3. **View Images in Gallery**
   - [ ] Open a request with images
   - [ ] Verify ImageGallery displays all images
   - [ ] Verify thumbnails are clickable
   - [ ] Verify download button appears for each image
   - [ ] Verify "Download All" button appears for multiple images

4. **Test Image Download**
   - [ ] Click download button on a single image
   - [ ] Verify image downloads with correct filename
   - [ ] Click "Download All (ZIP)" button
   - [ ] Verify ZIP file downloads
   - [ ] Extract ZIP and verify all images are included

5. **Test Image Lightbox**
   - [ ] Click on an image thumbnail
   - [ ] Verify lightbox opens with full-size image
   - [ ] Test navigation with arrow buttons
   - [ ] Test navigation with keyboard arrows
   - [ ] Test close with X button
   - [ ] Test close with ESC key
   - [ ] Test close by clicking backdrop
   - [ ] Test download from lightbox

6. **Test Status Updates**
   - [ ] Change request status from dropdown
   - [ ] Verify status updates in table
   - [ ] Verify status persists after page reload

### Browser Compatibility

Test on the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if available)

### Responsive Design

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Edge Cases

1. **Storage Limits**
   - [ ] Submit multiple requests with 5 images each
   - [ ] Monitor localStorage usage
   - [ ] Verify warning when approaching limit

2. **Empty States**
   - [ ] View Staff Dashboard with no requests
   - [ ] View request detail with no images
   - [ ] Verify appropriate placeholders appear

3. **Data Persistence**
   - [ ] Submit a request
   - [ ] Refresh the page
   - [ ] Verify request still appears in Staff Dashboard
   - [ ] Verify images are still accessible

4. **Error Recovery**
   - [ ] Simulate upload failure (disconnect network)
   - [ ] Verify error message appears
   - [ ] Verify user can retry

## Known Limitations

1. **Storage**: LocalStorage has a 5-10MB limit. With base64 encoding, this limits the total number of images that can be stored.

2. **Performance**: Large images may take time to convert to base64. The UI shows a loading indicator during this process.

3. **Browser Support**: Requires modern browsers with FileReader API and localStorage support.

## Troubleshooting

### Images not uploading
- Check browser console for errors
- Verify file size is under 5MB
- Verify file format is PNG, JPG, JPEG, or WEBP

### Images not appearing in Staff Dashboard
- Check localStorage in browser DevTools
- Verify data is being saved correctly
- Try refreshing the page

### Download not working
- Check browser's download settings
- Verify pop-up blocker is not blocking downloads
- Check browser console for errors

## Performance Tips

1. Use smaller images when possible (resize before upload)
2. Clear old requests periodically to free up storage
3. Avoid uploading maximum size images repeatedly

## Next Steps

After manual testing is complete:
1. Document any bugs found
2. Create issues for improvements
3. Consider adding automated E2E tests with Playwright or Cypress
