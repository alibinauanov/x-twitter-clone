# X (Twitter) Clone - Full Stack App

A complete Twitter/X clone built with Next.js 15, featuring real-time notifications, and all essential social media functionalities.

## Features

- **User Authentication** - Clerk authentication with GitHub/Google OAuth
- **Post System** - Create, like, comment, and share posts with image uploads
- **Real-time Notifications** - Live updates for likes, comments, and follows
- **Infinite Scrolling** - Smooth feed experience with React Query
- **User Profiles** - Complete profiles with bio, images, and post history
- **Follow System** - Follow/unfollow users with friend recommendations
- **Profile Editing** - Upload profile/cover images and edit bio
- **Responsive Design** - Mobile-first Twitter/X-style UI

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with hooks and server components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Query (TanStack Query)** - Data fetching and caching
- **Socket.io Client** - Real-time communication

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Database management and queries
- **MySQL** - Primary database (with Docker support)
- **Docker** - Containerized database and development environment
- **Socket.io** - Real-time server
- **Server Actions** - Modern Next.js server-side operations

### Authentication & Storage
- **Clerk** - User authentication and management
- **ImageKit** - Image optimization and CDN
- **Webhooks** - User sync between Clerk and database

### Validation & Forms
- **Zod** - Schema validation
- **React Hook Form** - Form state management
- **useActionState** - Server action state management

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── clerk-webhook/ # User sync webhook
│   │   ├── posts/         # Post CRUD operations
│   │   ├── users/         # User data and follow system
│   │   ├── comments/      # Comment system
│   │   └── profile/       # Profile updates
│   ├── [username]/        # Dynamic user profiles
│   │   └── status/[postId]/ # Individual post pages
│   ├── compose/post/      # Post creation
│   ├── sign-in/           # Authentication pages
│   └── sign-up/
├── components/            # Reusable UI components
│   ├── Post.tsx          # Post component
│   ├── Feed.tsx          # Infinite scroll feed
│   ├── Comments.tsx      # Comment system
│   ├── EditProfileModal.tsx # Profile editing
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useUser.ts        # User data fetching
│   ├── usePosts.ts       # Post data management
│   └── ...
├── contexts/             # React contexts
│   ├── SocketContext.tsx # Socket.io context
│   └── NotificationContext.tsx # Notification system
├── actions.tsx           # Server actions
├── utils.ts              # Utility functions
└── prisma.ts             # Prisma client
```

## Database Schema

### Core Models
```prisma
User {
  id          String   @id
  clerkId     String   @unique
  email       String   @unique
  username    String   @unique
  displayName String?
  bio         String?
  location    String?
  website     String?
  img         String?   // Profile image
  cover       String?   // Cover image
  posts       Post[]
  comments    Comment[]
  likes       Like[]
  followers   Follow[] @relation("UserFollowers")
  followings  Follow[] @relation("UserFollowings")
  notifications Notification[]
}

Post {
  id          String   @id @default(cuid())
  content     String
  img         String?
  video       String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  likes       Like[]
  comments    Comment[]
  createdAt   DateTime @default(now())
}

Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  post      Post     @relation(fields: [postId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

Like {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])
  postId String
  post   Post   @relation(fields: [postId], references: [id])
}

Follow {
  id          String @id @default(cuid())
  followerId  String
  follower    User   @relation("UserFollowers", fields: [followerId], references: [id])
  followingId String
  following   User   @relation("UserFollowings", fields: [followingId], references: [id])
}
```

## Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd x-twitter-clone
npm install
```

### 2. Environment Variables
Create `.env` file in root directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/twitter_clone"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxx

# ImageKit (Image Storage)
NEXT_PUBLIC_PUBLIC_KEY=public_xxxxxxxxx
PRIVATE_KEY=private_xxxxxxxxx
NEXT_PUBLIC_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# Socket.io (optional for real-time features)
SOCKET_IO_PORT=3001
```

### 3. Get Required API Keys

#### Clerk Authentication
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create new application
3. Get `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
4. Configure OAuth providers (GitHub, Google)
5. Set up webhook endpoint: `https://your-domain.com/api/clerk-webhook`
6. Get `CLERK_WEBHOOK_SECRET` from webhook settings

#### ImageKit (Image Storage)
1. Go to [ImageKit Dashboard](https://imagekit.io)
2. Create account and get:
   - `NEXT_PUBLIC_PUBLIC_KEY`
   - `PRIVATE_KEY`
   - `NEXT_PUBLIC_URL_ENDPOINT`

#### Database Setup
1. **Option 1: Docker (Recommended)**
   ```bash
   # Start MySQL with Docker
   docker run --name twitter-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=twitter_clone -p 3306:3306 -d mysql:8.0
   
   # Or use docker-compose if you have docker-compose.yml
   docker-compose up -d
   ```

2. **Option 2: Local MySQL**
   - Install MySQL locally or use cloud provider
   - Create database: `CREATE DATABASE twitter_clone;`

3. Update `DATABASE_URL` with your credentials:
   ```env
   # For Docker
   DATABASE_URL="mysql://root:password@localhost:3306/twitter_clone"
   
   # For local/cloud MySQL
   DATABASE_URL="mysql://username:password@localhost:3306/twitter_clone"
   ```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Docker Setup (Optional)

If you prefer using Docker for development:

```bash
# Create docker-compose.yml file
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: twitter-mysql
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: twitter_clone
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down
```

## Data Flow & Logic

### Authentication Flow
1. User signs in via Clerk (GitHub/Google OAuth)
2. Clerk webhook triggers `/api/clerk-webhook`
3. User data synced to database via Prisma
4. JWT token stored in cookies for API authentication

### Post Creation Flow
1. User submits post form with optional image
2. Server Action validates data with Zod
3. Image uploaded to ImageKit if present
4. Post saved to database with user relationship
5. React Query cache invalidated for real-time updates

### Real-time Notifications
1. Socket.io server listens for database changes
2. Events triggered on like, comment, follow actions
3. Notifications sent to relevant users via WebSocket
4. Client receives and displays notifications instantly

### Infinite Scroll Implementation
1. React Query `useInfiniteQuery` fetches posts in batches
2. Intersection Observer detects scroll to bottom
3. Automatic fetch of next page with loading states
4. Smooth user experience with optimistic updates

## Key Features Implementation

### Like System
- Optimistic updates with `useOptimistic` hook
- Server Actions for database mutations
- Real-time notification to post author

### Comment System
- Nested comment structure in database
- Real-time updates via Socket.io
- Infinite scroll for large comment threads

### Follow System
- Mutual follow relationships
- Friend recommendations based on mutual connections
- Real-time follower count updates

### Profile Editing
- Image upload with preview
- Form validation with character limits
- Real-time profile updates across app

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with automatic builds

### Environment Setup for Production
- Use PlanetScale or AWS RDS for MySQL (or Docker containers)
- Configure Clerk production keys
- Set up ImageKit production account
- Configure Socket.io for production scaling
- Use Docker for consistent deployment environments

## Performance Features

- **React Query Caching** - Intelligent data caching and synchronization
- **Image Optimization** - ImageKit CDN with automatic resizing
- **Infinite Scroll** - Smooth pagination without page reloads
- **Optimistic Updates** - Instant UI feedback before server confirmation
- **Code Splitting** - Dynamic imports for faster initial load

## Security Features

- **Authentication** - Clerk handles secure user management
- **Input Validation** - Zod schemas for all user inputs
- **File Upload Security** - ImageKit handles file validation
- **Rate Limiting** - Built-in API route protection
- **CSRF Protection** - Next.js built-in security features

## Testing

```bash
# Run tests
npm run test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE file for details.