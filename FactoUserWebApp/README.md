# Facto Financial Services Web App

Modern, responsive web application for Facto Financial Services, built with React, TypeScript, and Tailwind CSS.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Available Scripts](#available-scripts)

## Features

- 🏠 **Home Page** - Hero section, services overview, testimonials, courses, and news
- 🔐 **Authentication** - Secure login and signup pages
- 📋 **Services** - Detailed service information and booking
- 📄 **Document Upload** - Secure document management
- 💳 **Payment Processing** - Integrated Razorpay payment gateway
- 🌙 **Dark Mode** - Toggle between light and dark themes with persistent preference
- 📱 **Responsive Design** - Mobile-first, fully responsive layout
- 🎓 **Courses** - View and purchase online courses
- 📰 **Blogs** - Read latest blogs and news
- 👤 **User Dashboard** - Personal dashboard with purchased services

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Theme**: next-themes
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Notifications**: Sonner

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Backend API running (see FactoBackendServices README)

## Installation

1. **Navigate to the user web app directory:**
   ```bash
   cd FactoUserWebApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the backend API URL** (see [Configuration](#configuration) below)

## Configuration

### Backend API Configuration

The API base URL is configured in `src/api/services.ts` (and other API files):

```typescript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

For production, update this to your production API URL:

```typescript
const API_BASE_URL = 'https://api.facto.org.in/api/v1';
```

### Environment Variables (Optional)

You can create a `.env` file in the project root:

```env
# Backend API URL
VITE_API_URL=http://localhost:8080/api/v1

# Razorpay Key ID (if not using hardcoded fallback)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Note**: Don't forget to restart the development server after changing environment variables.

## Development

### Start Development Server

```bash
npm run dev
```

This will start the development server at `http://localhost:5173` (or the next available port).

### Running with Backend

1. **Start the backend server** (see Backend Services README)
2. **Start this frontend server**
3. Open `http://localhost:5173` in your browser

## Building for Production

### Build for Production

```bash
npm run build
```

This will:
1. Run TypeScript type checking (`tsc`)
2. Build the production bundle (`vite build`)
3. Output optimized static files to `dist/` directory

### Preview Production Build

```bash
npm run preview
```

Preview the production build locally before deploying.

### Build Output

The build creates static files in `dist/`:
- `dist/index.html` - Entry HTML file
- `dist/assets/` - Compiled and minified JS and CSS files

## Deployment

### Option 1: Static Hosting (Recommended)

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### AWS S3 + CloudFront

```bash
# Build the project
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 2: Nginx Web Server

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Copy files to server:**
   ```bash
   scp -r dist/* user@server:/var/www/web-app/
   ```

3. **Nginx configuration:**
   ```nginx
   server {
       listen 80;
       server_name facto.org.in;
       
       root /var/www/web-app;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

### Option 3: Docker Deployment

Create a `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t facto-web-app .
docker run -p 80:80 facto-web-app
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/                    # API service files
│   ├── blogs.ts
│   ├── courses.ts
│   └── services.ts
├── components/             # React components
│   ├── ui/                # Reusable UI components (shadcn/ui)
│   ├── Auth/
│   ├── Course/
│   ├── Dashboard/
│   ├── Document/
│   ├── Payment/
│   ├── Services/
│   └── ... (other feature components)
├── contexts/               # React Context providers
│   └── AuthContext.tsx     # Authentication state
├── styles/                 # Global styles
│   └── index.css
└── main.tsx               # Application entry point
```

## Key Features Implementation

### Authentication

- JWT-based authentication
- Protected routes
- Token storage in localStorage
- Automatic token refresh

### Payment Integration

- Razorpay payment gateway
- Test mode support
- Order creation and verification
- Payment success/failure handling

### Theme Support

The app supports light and dark themes with persistent user preference. Default theme is dark mode.

### Document Management

- Secure file uploads to Cloudinary
- Document preview
- User-specific document storage

## Backend Integration

### Required Backend Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /services` - Get all services
- `GET /sub-services/all` - Get all sub-services
- `GET /sub-services/my-services` - Get user's services
- `POST /payment/create-order` - Create payment order
- `POST /payment/verify` - Verify payment
- `GET /courses` - Get all courses
- `GET /blogs` - Get all blogs

### CORS Configuration

Ensure your backend CORS settings include the frontend URL:

```typescript
// Backend CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://facto.org.in'],
  credentials: true
}));
```

## Important Notes

### API Configuration

Update API base URL in all API files before production deployment:
- `src/api/services.ts`
- `src/api/blogs.ts`
- `src/api/courses.ts`

### Razorpay Integration

Payment integration is configured in service components. For production:
1. Update Razorpay keys
2. Switch from test to live keys
3. Configure webhook URLs

### Environment Variables

For environment-specific builds:
- Create `.env.development` for dev
- Create `.env.production` for production
- Use `import.meta.env.VITE_*` to access variables

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Type Errors

```bash
# Run TypeScript check
npx tsc --noEmit
```

### Payment Issues

- Verify Razorpay keys are correct
- Check network console for API errors
- Ensure backend payment endpoints are working
- Use test card: `4111 1111 1111 1111`

### API Connection Issues

- Verify backend is running
- Check CORS configuration
- Verify API URLs in source files
- Check browser console for errors

## Testing Payment

Use Razorpay test credentials:

**Test Card Details:**
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **Name**: Any name

## License

This project is proprietary to Facto Financial Services.

## Support

For issues or questions, contact the development team or create an issue in the repository.
