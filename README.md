# Facto Consultancy Application

Complete full-stack application for Facto Financial Services - a comprehensive platform for delivering financial consultancy and related services.

## 🏗️ Project Overview

This repository contains three main applications:

1. **Backend Services** - Node.js + Express + MongoDB API server
2. **Admin App** - React-based admin dashboard for managing services
3. **User Web App** - React-based customer-facing web application

## 📁 Project Structure

```
FactoConsultancyApp/
├── FactoBackendServices/     # Backend API Server
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── README.md
│
├── FactoAdminApp/            # Admin Dashboard
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── README.md
│
└── FactoUserWebApp/          # Customer Web App
    ├── src/
    ├── dist/
    ├── package.json
    └── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **MongoDB** 6.0+ installed and running
- **npm** or **yarn** package manager
- **Cloudinary** account (for file storage)
- **Razorpay** account (for payments)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd FactoConsultancyApp
   ```

2. **Setup Backend Services:**
   ```bash
   cd FactoBackendServices
   npm install
   # Create .env file with required variables
   # See FactoBackendServices/README.md for details
   ```

3. **Setup Admin App:**
   ```bash
   cd FactoAdminApp
   npm install
   # Configure API URL in src/utils/apiConstants.ts
   ```

4. **Setup User Web App:**
   ```bash
   cd FactoUserWebApp
   npm install
   # Configure API URL in src/api files
   ```

### Development

**Start Backend:**
```bash
cd FactoBackendServices
npm start
# Server runs on http://localhost:8080
```

**Start Admin App:**
```bash
cd FactoAdminApp
npm run dev
# App runs on http://localhost:5173
```

**Start User Web App:**
```bash
cd FactoUserWebApp
npm run dev
# App runs on http://localhost:5174
```

## 📚 Documentation

Each project has its own comprehensive README:

- **Backend**: [FactoBackendServices/README.md](./FactoBackendServices/README.md)
- **Admin**: [FactoAdminApp/README.md](./FactoAdminApp/README.md)
- **User**: [FactoUserWebApp/README.md](./FactoUserWebApp/README.md)

## 🏗️ Building for Production

### Backend

```bash
cd FactoBackendServices
npm run build-ts:prod
npm run start:prod
```

### Admin App

```bash
cd FactoAdminApp
npm run build
# Deploy dist/ folder to static hosting
```

### User Web App

```bash
cd FactoUserWebApp
npm run build
# Deploy dist/ folder to static hosting
```

## 🚀 Deployment Guide

### Environment Setup

1. **Backend Deployment:**
   - Deploy to cloud service (AWS, Heroku, DigitalOcean, etc.)
   - Set up MongoDB (Atlas or self-hosted)
   - Configure environment variables
   - Use PM2 for process management
   - See [Backend README](./FactoBackendServices/README.md) for details

2. **Frontend Deployments:**
   - Build both apps using `npm run build`
   - Deploy `dist/` folder to static hosting:
     - Netlify (recommended)
     - Vercel
     - AWS S3 + CloudFront
     - GitHub Pages
   - Update API URLs to point to production backend
   - See individual READMEs for detailed instructions

### Deployment Order

1. Deploy Backend first
2. Update frontend API URLs to point to production backend
3. Deploy Admin App
4. Deploy User Web App

## 🔧 Configuration

### Required Services

- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Payment Gateway**: Razorpay
- **SMS** (Optional): Twilio

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb://...
PORT=8080
JWT_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

#### Frontend
Update API base URLs in respective configuration files:
- Admin: `src/utils/apiConstants.ts`
- User: `src/api/services.ts`, `src/api/blogs.ts`, `src/api/courses.ts`

## 🎯 Features

### Backend Services
- RESTful API with Express
- JWT Authentication & Authorization
- Payment processing with Razorpay
- File uploads to Cloudinary
- SMS notifications (Twilio)
- User, Service, Course, Blog management
- Database: MongoDB with Mongoose

### Admin App
- User & Service management
- Blog & Course management
- Notifications system
- Query & Consultation management
- Analytics dashboard
- Employee management

### User Web App
- Service browsing and booking
- Course enrollment
- Blog reading
- Payment processing
- Document management
- User dashboard
- Dark/Light theme support

## 📝 Available Scripts

### Backend
- `npm start` - Development server
- `npm run build-ts:prod` - Production build
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint

### Frontend (Both Apps)
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛠️ Tech Stack

### Backend
- Node.js, Express, TypeScript
- MongoDB, Mongoose
- JWT, bcrypt
- Razorpay, Cloudinary, Twilio

### Frontend
- React 18, TypeScript
- Vite
- Tailwind CSS
- Radix UI, shadcn/ui
- Axios
- React Router
- Framer Motion, Recharts

## 📦 Deployment Options

### Recommended Setup

**Backend:**
- Cloud Provider: AWS EC2 / DigitalOcean / Heroku
- Process Manager: PM2
- Database: MongoDB Atlas
- Reverse Proxy: Nginx

**Frontend:**
- Admin: Netlify / Vercel
- User: Netlify / Vercel
- CDN: CloudFlare (optional)

## 🔐 Security Notes

- Never commit `.env` files
- Use strong JWT secrets in production
- Enable HTTPS for all deployments
- Configure CORS properly
- Use environment variables for sensitive data
- Regularly update dependencies

## 📊 Project Status

- ✅ Backend Services - Complete
- ✅ Admin App - Complete
- ✅ User Web App - Complete
- ⚠️ Production-ready pending deployment configuration

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is proprietary to Facto Financial Services.

## 📞 Support

For issues, questions, or deployment help:
- Check individual project READMEs for detailed documentation
- Contact the development team
- Create an issue in the repository

## 🎓 Additional Resources

- [Backend Deployment Guide](./FactoBackendServices/README.md)
- [Admin App Guide](./FactoAdminApp/README.md)
- [User Web App Guide](./FactoUserWebApp/README.md)
- [Environment Setup Guide](./FactoBackendServices/ENVIRONMENT_SETUP.md)

---

**Built with ❤️ by Facto Financial Services**















