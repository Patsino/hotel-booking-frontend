import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { HotelSearchPage } from './pages/HotelSearchPage/HotelSearchPage';
import { BookingPage } from './pages/BookingPage/BookingPage';
import { MyReservationsPage } from './pages/MyReservationsPage/MyReservationsPage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import { PaymentPage } from './pages/PaymentPage/PaymentPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<HotelSearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/booking"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservations"
              element={
                <ProtectedRoute>
                  <MyReservationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservations/:id"
              element={
                <ProtectedRoute>
                  <MyReservationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
