# Facto Admin App

Admin dashboard for managing Facto Financial Services, built with React, TypeScript, Vite, and Tailwind CSS.

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

- 📊 **Dashboard** - Overview of users, services, and revenue
- 👥 **User Management** - View and manage all users
- 🛠️ **Service Management** - Create and manage services and sub-services
- 📝 **Blog Management** - Create and manage blog posts
- 🎓 **Course Management** - Manage courses and lectures
- 📢 **Notifications** - Send notifications to users
- 🔔 **Query Management** - Handle customer queries
- 📞 **Call Requests** - Manage customer call requests
- 💼 **Employees** - Manage employee accounts
- 💰 **Subscriptions** - View and manage subscriptions
- 📄 **Quotations** - Manage service quotations

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Tables**: TanStack Table
- **Charts**: Recharts
- **Date Handling**: date-fns, moment

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Backend API running (see Backend Services README)

## Installation

1. **Navigate to the admin app directory:**
   ```bash
   cd FactoAdminApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the backend API URL** (see [Configuration](#configuration) below)

## Configuration

### Backend API Configuration

Edit `src/utils/apiConstants.ts` to set the correct backend API URL:

```typescript
// For development (default)
export const BASE_URL = "http://localhost:8080/api/v1";

// For production (uncomment and update as needed)
// export const BASE_URL = 'https://api.facto.org.in/api/v1';
```

### Environment Variables (Optional)

You can create a `.env` file in the project root for environment-specific configuration:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

Then update `apiConstants.ts` to use environment variables:

```typescript
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
```

**Note**: Don't forget to restart the development server after changing environment variables.

## Development

### Start Development Server

```bash
npm run dev
```

This will start the development server at `http://localhost:5173` (or the next available port).

### Login Credentials

The admin app requires authentication. Make sure:
1. Backend is running
2. Admin user account exists in the database
3. Use valid credentials to login

For creating an admin user, see the backend documentation or use the admin creation script.

## Building for Production

### Build for Production

```bash
npm run build
```

This will:
1. Run TypeScript type checking (`tsc -b`)
2. Build the production bundle (`vite build`)
3. Output files to `dist/` directory

### Preview Production Build

```bash
npm run preview
```

Preview the production build locally to test before deployment.

### Build Output

The build process creates optimized static files in the `dist/` directory:
- `dist/index.html` - Entry HTML file
- `dist/assets/` - Compiled JS and CSS files

## Deployment

### Option 1: Static Hosting (Recommended)

The built app is a static site that can be deployed to any static hosting service:

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

#### GitHub Pages
```bash
# Build the project
npm run build

# Copy dist contents to gh-pages branch
# Follow GitHub Pages deployment guide
```

### Option 2: Nginx Web Server

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Copy dist files to server:**
   ```bash
   scp -r dist/* user@server:/var/www/admin-app/
   ```

3. **Nginx configuration:**
   ```nginx
   server {
       listen 80;
       server_name admin.facto.org.in;
       
       root /var/www/admin-app;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
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
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t facto-admin-app .
docker run -p 80:80 facto-admin-app
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
src/
├── api/                    # API service files
│   ├── blogs/
│   ├── courses/
│   ├── documents/
│   ├── employee/
│   ├── notifications/
│   ├── query/
│   ├── reqcall/
│   ├── services/
│   ├── signin/
│   ├── sub-services/
│   └── user/
├── components/             # React components
│   ├── ui/                # Reusable UI components (shadcn/ui)
│   ├── Blogs/
│   ├── Courses/
│   ├── Dashboard/
│   ├── Employe/
│   ├── Notification/
│   ├── Query/
│   ├── Quotation/
│   ├── ReqCall/
│   ├── subscription/
│   ├── Users/
│   └── common/
├── config/                 # Configuration files
│   └── axiosConfig.ts      # Axios configuration
├── context/                # React Context providers
│   └── GlobalContext.tsx   # Global state management
├── hooks/                  # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                    # Utility libraries
│   └── utils.ts
├── pages/                  # Page components
│   ├── Blogs/
│   ├── Courses/
│   ├── Dashboard/
│   ├── Employee/
│   ├── Notiifcations/
│   ├── Query/
│   ├── Quotations/
│   ├── ReqCall/
│   ├── SignIn/
│   ├── Subscriptions/
│   └── Users/
├── router/                 # Routing configuration
│   └── Router.tsx
└── utils/                  # Utility functions
    ├── apiConstants.ts     # API endpoints
    ├── axiosUtils.ts
    └── toast.ts
```

## Important Notes

### Backend CORS Configuration

Ensure your backend CORS settings allow requests from your frontend domain:

```typescript
// Backend CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://admin.facto.org.in'],
  credentials: true
}));
```

### API Authentication

The admin app uses JWT tokens for authentication. Tokens are stored in localStorage and sent with API requests.

### Environment-Specific Builds

For different environments, you can:
1. Use environment variables
2. Create separate config files
3. Use different build scripts

## Troubleshooting

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Type Errors

```bash
# Check TypeScript compilation
npx tsc --noEmit
```

### API Connection Issues

- Verify backend API is running
- Check CORS configuration
- Verify API URL in `apiConstants.ts`
- Check browser console for detailed errors

## License

This project is proprietary to Facto Financial Services.

## Support

For issues or questions, contact the development team or create an issue in the repository.
