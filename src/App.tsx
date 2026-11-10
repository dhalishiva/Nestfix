import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { Layout, RequireAuth } from './components/Layout';
import { Providers } from './state';
import Home from './pages/Home';
import Category from './pages/Category';
import Cart from './pages/Cart';
import Bookings, { BookingDetail } from './pages/Bookings';
import Account, { Addresses } from './pages/Account';
import { ForgotPassword, Login, ResetPassword, Signup } from './pages/Auth';
import { Empty } from './components/ui';

const Admin = lazy(() => import('./pages/admin/Admin').then((m) => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import('./pages/admin/Admin').then((m) => ({ default: m.AdminOverview })));
const AdminBookings = lazy(() => import('./pages/admin/Admin').then((m) => ({ default: m.AdminBookings })));
const AdminPros = lazy(() => import('./pages/admin/Admin').then((m) => ({ default: m.AdminPros })));
const AdminServices = lazy(() => import('./pages/admin/Admin').then((m) => ({ default: m.AdminServices })));
const AdminOffers = lazy(() => import('./pages/admin/Admin').then((m) => ({ default: m.AdminOffers })));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const TITLES: [RegExp, string][] = [
  [/^\/c\//, 'Services'], [/^\/cart/, 'Cart'], [/^\/bookings\/./, 'Booking'], [/^\/bookings/, 'My bookings'],
  [/^\/account/, 'Account'], [/^\/login/, 'Log in'], [/^\/signup/, 'Create account'], [/^\/admin/, 'Admin'],
];
function DocTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const t = TITLES.find(([r]) => r.test(pathname))?.[1];
    document.title = t ? `${t} · Nestfix` : 'Nestfix · Home services at your door';
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <ScrollTop /><DocTitle />
        <Suspense fallback={<div className="empty"><div className="spin-lg" /></div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="c/:id" element={<Category />} />
              <Route path="cart" element={<Cart />} />
              <Route path="bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
              <Route path="bookings/:code" element={<RequireAuth><BookingDetail /></RequireAuth>} />
              <Route path="account" element={<Account />} />
              <Route path="account/addresses" element={<RequireAuth><Addresses /></RequireAuth>} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="admin" element={<Admin />}>
                <Route index element={<AdminOverview />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="pros" element={<AdminPros />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="offers" element={<AdminOffers />} />
              </Route>
              <Route path="*" element={<Empty icon="search" title="Page not found"><p className="muted">The page you opened doesn't exist.</p><Link className="btn" to="/">Go home</Link></Empty>} />
            </Route>
          </Routes>
        </Suspense>
      </Providers>
    </BrowserRouter>
  );
}
