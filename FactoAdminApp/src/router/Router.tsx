import React from 'react';
import {  Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useGlobalContext } from '@/context/GlobalContext';
import AppSidebar from '@/components/common/AppSidebar';
import SignIn from '@/pages/SignIn/SignIn';
import Dashboard from '@/pages/Dashboard/dashboard';
import Users from '@/pages/Users/users';
import Subscriptions from '@/pages/Subscriptions/Subscriptions';
import ServiceDetails from '@/components/subscription/ServiceDetails';
import Courses from '@/pages/Courses/Courses';
// import CourseEdit from '@/components/Courses/CourseEdit';
import Blogs from '@/pages/Blogs/Blogs';
import Notifications from '@/pages/Notiifcations/Notifications';
import Query from '@/pages/Query/Query';
import Employee from '@/pages/Employee/Employee';
import ReqCall from '@/pages/ReqCall/ReqCall';
import QuotationManagement  from '@/pages/Quotations/QuotationManagement';
import ConsultationManagement from '@/pages/Consultations/ConsultationManagement';
import Newsletter from '@/pages/Newsletter/Newsletter';
// ProtectedRoute Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useGlobalContext();
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace={true} />
  );
};

// Layout Wrapper Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="flex h-screen font-outfit">
      {/* Sidebar - only show when not on the login page */}
      {!isLoginPage && <AppSidebar />}
      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto ${isLoginPage ? '' : 'pl-6'}`}>
        {children}
      </div>
    </div>
  );
};

const Router = () => {
  return (
      <Layout>
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<SignIn />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee"
            element={
              <ProtectedRoute>
                <Employee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/details"
            element={
              <ProtectedRoute>
                <ServiceDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <ProtectedRoute>
                <QuotationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultations"
            element={
              <ProtectedRoute>
                <ConsultationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute>
                <Courses/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <Blogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <ReqCall />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/query"
            element={
              <ProtectedRoute>
                <Query />
              </ProtectedRoute>
            }
          />
          <Route
            path="/newsletter"
            element={
              <ProtectedRoute>
                <Newsletter />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
  );
};

export default Router;
