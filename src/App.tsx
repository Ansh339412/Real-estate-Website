import { lazy, Suspense } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PhotoPrompt } from './components/ui/PhotoPrompt';
import { PageTransition } from './components/ui/PageTransition';
import { ErrorView, kindToCode } from './components/errors/ErrorView';
import { OfflineBanner } from './components/errors/OfflineBanner';
import { useProperties } from './context/PropertiesContext';
import { ForbiddenPage, ServerErrorPage, TooManyRequestsPage, UnauthorizedPage } from './pages/ErrorPages';
import HomePage from './pages/HomePage';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { AdminRoute } from './components/routing/AdminRoute';

// Route-level code splitting: each page downloads only when visited.
const ListingsPage = lazy(() => import('./pages/ListingsPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewListingPage = lazy(() => import('./pages/NewListingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const page = (el: React.ReactNode) => <PageTransition>{el}</PageTransition>;

export default function App() {
  const location = useLocation();
  const { failure, properties, loading, refresh } = useProperties();
  // If the very first data load fails, show a clear page instead of an empty site.
  const fatal = !loading && failure !== null && properties.length === 0 && failure.kind !== 'not-found' ? failure : null;
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to main content</a>
        <OfflineBanner />
        <Header />
        <main id="main" className="flex-1">
          <Suspense fallback={<div className="min-h-[85vh] p-10 text-center" role="status">Loading…</div>}>
            {fatal ? (
              <ErrorView code={kindToCode(fatal.kind)} reference={fatal.reference} onRetry={() => void refresh()} />
            ) : (
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={page(<HomePage />)} />
                <Route path="/listings" element={page(<ListingsPage />)} />
                <Route path="/saved" element={page(<SavedPage />)} />
                <Route path="/properties/:id" element={page(<PropertyDetailPage />)} />
                <Route path="/login" element={page(<LoginPage />)} />
                <Route path="/forgot-password" element={page(<ForgotPasswordPage />)} />
                <Route path="/reset-password" element={page(<ResetPasswordPage />)} />
                <Route path="/signup" element={page(<SignUpPage />)} />
                <Route path="/contact" element={page(<ContactPage />)} />
                <Route path="/legal/:slug" element={page(<LegalPage />)} />
                <Route path="/401" element={page(<UnauthorizedPage />)} />
                <Route path="/403" element={page(<ForbiddenPage />)} />
                <Route path="/429" element={page(<TooManyRequestsPage />)} />
                <Route path="/500" element={page(<ServerErrorPage />)} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={page(<DashboardPage />)} />
                  <Route path="/dashboard/new" element={page(<NewListingPage />)} />
                  <Route path="/profile" element={page(<ProfilePage />)} />
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={page(<AdminPage />)} />
                  </Route>
                </Route>
                <Route path="*" element={page(<NotFoundPage />)} />
              </Routes>
            </AnimatePresence>
            )}
          </Suspense>
        </main>
        <Footer />
        <PhotoPrompt />
      </div>
    </MotionConfig>
  );
}
