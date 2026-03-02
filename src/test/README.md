# Test Infrastructure

This directory contains test setup and utilities for the Custom Service Image Upload feature.

## Files

- `setup.ts` - Vitest setup file that runs before all tests
- `testUtils.ts` - Utility functions and arbitraries for generating test data

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## Test Utilities

### Fast-check Arbitraries

- `arbValidImageFile` - Generates valid image file metadata
- `arbImageFile` - Generates complete ImageFile objects
- `arbImageFileArray` - Generates arrays of 1-5 ImageFile objects
- `arbCustomRequest` - Generates complete CustomRequest objects

### Helper Functions

- `generateBase64Image(format)` - Creates a valid base64 image string
- `createMockFile(name, size, type, content)` - Creates a mock File object
- `createMockFiles(count)` - Creates multiple mock File objects
- `base64ToBlob(base64)` - Converts base64 string to Blob

## Property-Based Testing

All property tests should:
1. Run a minimum of 100 iterations
2. Include a comment tag: `// Feature: custom-service-image-upload, Property {number}: {description}`
3. Reference the design document property number

Example:
```typescript
// Feature: custom-service-image-upload, Property 1: Image preview display
it('should display preview for all selected images', () => {
  fc.assert(
    fc.property(arbImageFileArray, (images) => {
      // Test implementation
    }),
    { numRuns: 100 }
  )
})
```
