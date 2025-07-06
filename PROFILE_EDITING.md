# Profile Editing Feature

## Overview
This feature allows users to edit their profile information including:
- Profile picture upload
- Cover image upload
- Display name
- Bio (up to 160 characters)
- Location
- Website URL

## How to Use

1. **Navigate to Your Profile**: Click on your profile link in the sidebar or go to `/@yourusername`

2. **Open Edit Modal**: Click the "Edit profile" button (only visible on your own profile)

3. **Edit Information**:
   - **Profile Picture**: Click the camera icon on your profile picture to upload a new image
   - **Cover Image**: Click the camera icon on the cover area to upload a new cover image
   - **Display Name**: Enter your preferred display name (max 50 characters)
   - **Bio**: Add a short bio about yourself (max 160 characters)
   - **Location**: Add your location
   - **Website**: Add your website URL

4. **Save Changes**: Click the "Save" button to update your profile

## Technical Implementation

### Frontend Components
- `EditProfileModal.tsx`: Main modal component for editing profile
- Image upload with preview functionality
- Form validation with character limits
- Success/error messaging

### Backend API
- `POST /api/profile/update`: Handles profile updates
- Image upload to ImageKit
- Database updates via Prisma

### Features
- **Image Upload**: Supports profile and cover image uploads
- **Form Validation**: Character limits and required field validation
- **Real-time Preview**: See image changes before saving
- **Success Feedback**: Shows success message after saving
- **Error Handling**: Displays errors if upload fails

## Environment Variables Required
Make sure these are set in your environment:
- `NEXT_PUBLIC_PUBLIC_KEY`: ImageKit public key
- `PRIVATE_KEY`: ImageKit private key  
- `NEXT_PUBLIC_URL_ENDPOINT`: ImageKit URL endpoint

## Database Schema
The user profile information is stored in the `User` model:
```prisma
model User {
  id          String  @id @default(cuid())
  displayName String?
  bio         String?
  location    String?
  website     String?
  img         String?  // Profile image URL
  cover       String?  // Cover image URL
  // ... other fields
}
```

## Usage Notes
- Images are automatically optimized and stored via ImageKit
- Profile and cover images are resized appropriately
- All changes are reflected immediately across the application
- User data is cached and invalidated properly via React Query
