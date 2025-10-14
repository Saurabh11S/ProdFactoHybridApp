import React, { useState } from 'react';
import { DarkModeProvider } from './components/DarkModeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CoursesSection } from './components/CoursesSection';
import { FinanceShortsSection } from './components/FinanceShortsSection';
import { NewsSection } from './components/NewsSection';
import { Footer } from './components/Footer';
import { ServicesPage } from './components/ServicesPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ServiceDetailsPage } from './components/ServiceDetailsPage';
import { DocumentUploadPage } from './components/DocumentUploadPage';
import { PaymentPage } from './components/PaymentPage';
import { Learning } from './components/Learning';
import { Shorts } from './components/Shorts';
import { Updates } from './components/Updates';
import { UserProfile } from './components/UserProfile';
import { SessionWarning } from './components/SessionWarning';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('itr-1');

  const handleNavigation = (page: PageType, serviceId?: string) => {
    setCurrentPage(page);
    if (serviceId) {
      setSelectedServiceId(serviceId);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'services':
        return <ServicesPage onNavigate={handleNavigation} />;
      case 'learning':
        return <Learning onNavigate={handleNavigation} />;
      case 'shorts':
        return <Shorts onNavigate={handleNavigation} />;
      case 'updates':
        return <Updates onNavigate={handleNavigation} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigation} />;
      case 'signup':
        return <SignupPage onNavigate={handleNavigation} />;
      case 'service-details':
        return <ServiceDetailsPage onNavigate={handleNavigation} serviceId={selectedServiceId} />;
      case 'documents':
        return <DocumentUploadPage onNavigate={handleNavigation} />;
      case 'payment':
        return <PaymentPage onNavigate={handleNavigation} serviceId={selectedServiceId} />;
      case 'profile':
        return <UserProfile onNavigate={handleNavigation} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-white dark:from-gray-900 dark:to-gray-800">
            <main className="relative">
              <HeroSection onNavigate={handleNavigation} />
              <ServicesSection onNavigate={handleNavigation} />
              <TestimonialsSection onNavigate={handleNavigation} />
              <CoursesSection onNavigate={handleNavigation} />
              <FinanceShortsSection onNavigate={handleNavigation} />
              <NewsSection onNavigate={handleNavigation} />
            </main>
            <Footer />
          </div>
        );
    }
  };

  return (
    <DarkModeProvider>
      <AuthProvider>
        <div className="min-h-screen relative bg-background text-foreground">
          {/* Session Warning */}
          <SessionWarning />
          
          {/* Navigation - Hidden on login and signup pages */}
          {currentPage !== 'login' && currentPage !== 'signup' && (
            <Navigation 
              currentPage={currentPage}
              onNavigate={handleNavigation}
            />
          )}

          {/* Page Content */}
          <div className="w-full">
            {renderPage()}
          </div>
        </div>
      </AuthProvider>
    </DarkModeProvider>
  );
}