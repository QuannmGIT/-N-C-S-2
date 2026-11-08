import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './lib/auth.jsx'
import { ToastProvider } from './lib/toast.jsx'
import HomePage from './pages/HomePage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import PaymentInvoicePage from './pages/PaymentInvoicePage.jsx'
import BlogPage from './pages/BlogPage.jsx'
import PostPage from './pages/PostPage.jsx'
import CreatePostPage from './pages/CreatePostPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'

/**
 * Cross-page anchors (blog nav -> /#contact-section, project CTA ->
 * /#product-section) used to be real goto links (main.html#contact-section).
 * Now the hero ids live on the Home page, so scroll to the hash after the
 * route transition.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 350) // let the page CSS (+ reveal) settle like the static pages did
      return () => clearTimeout(timer)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ScrollManager />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/:orderCode" element={<PaymentInvoicePage />} />
          <Route path="/invoice/:orderCode" element={<PaymentInvoicePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/create" element={<CreatePostPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/blog/:slug" element={<PostPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/account" element={<AccountPage />} />
          {/* Dedicated Dev/Admin Console Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/dev/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/dev" element={<AdminDashboardPage />} />
          <Route path="/admin/blog" element={<AdminDashboardPage defaultTab="articles" />} />
          <Route path="/dev/blog" element={<AdminDashboardPage defaultTab="articles" />} />
          <Route path="/admin/revenue" element={<AdminDashboardPage defaultTab="revenue" />} />
          <Route path="/dev/revenue" element={<AdminDashboardPage defaultTab="revenue" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
