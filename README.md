# Hotel Booking Frontend

A modern React + TypeScript SPA for hotel booking system.

## Features

- 🔐 Authentication (Login/Register)
- 🔍 Hotel Search with filters
- 📅 Date-based availability search
- 💳 Reservation booking
- 📊 User reservations dashboard
- 🎨 Responsive design (mobile + desktop)
- ⚡ Fast and modern UI with Vite

## Architecture

The project follows a clean architecture pattern with clear separation of concerns:

```
src/
├── components/          # Reusable UI components
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Loading/
│   ├── Toast/
│   ├── Navbar/
│   └── ProtectedRoute/
├── pages/              # Page components (containers)
├── pages/              # Page components (containers)
│   ├── LoginPage/
│   ├── RegisterPage/
│   ├── HotelSearchPage/
│   ├── BookingPage/
│   └── MyReservationsPage/
├── services/           # API interaction layer
│   ├── api.ts          # Centralized axios configuration
│   ├── authService.ts
│   ├── hotelService.ts
│   ├── reservationService.ts
│   └── paymentService.ts
├── store/              # Global state management (Zustand)
│   └── authStore.ts
├── types/              # TypeScript interfaces/types
│   └── index.ts
└── App.tsx             # Main app with routing
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management (lightweight Redux alternative)
- **Axios** - HTTP client with interceptors
- **TanStack Query** - Server state management
- **date-fns** - Date utilities

## Prerequisites

- Node.js 18+ and npm
- Backend services running:
  - Users Service (default: http://localhost:5001)
  - Hotels Service (default: http://localhost:5002)
  - Reservations Service (default: http://localhost:5003)
  - Payments Service (default: http://localhost:5004)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
VITE_USERS_API_URL=http://localhost:5001
VITE_HOTELS_API_URL=http://localhost:5002
VITE_RESERVATIONS_API_URL=http://localhost:5003
VITE_PAYMENTS_API_URL=http://localhost:5004
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## Linting

```bash
npm run lint
```

## Project Requirements Compliance

### ✅ Minimum Requirements Met

1. **Architecture**
   - ✅ Clear separation: Components, Pages, Services, Store
   - ✅ Routing with 5+ routes
   - ✅ State management: Local state + Global state (Zustand)
   - ✅ Clear project structure with organized folders
   - ✅ API interaction with TypeScript interfaces
   - ✅ Centralized axios service with interceptors
   - ✅ Error handling and loading states

2. **Implementation**
   - ✅ Built with Vite bundler
   - ✅ Component-based UI architecture
   - ✅ Reusable components (Button, Input, Card, etc.)
   - ✅ Layout components (Navbar)
   - ✅ Custom components with proper styling
   - ✅ Forms with validation
   - ✅ Data tables/lists
   - ✅ Filtering and searching functionality
   - ✅ Responsive layout (desktop + mobile)
   - ✅ Clean, readable code
   - ✅ TypeScript for type safety

3. **Error Handling**
   - ✅ Global error interceptor in axios
   - ✅ Toast notifications for errors
   - ✅ Proper handling of 401/403/404/500
   - ✅ Loading states for all async operations

4. **Restrictions Compliance**
   - ✅ CSS architecture with separate files
   - ✅ Multiple specialized components
   - ✅ Tokens stored securely (localStorage via Zustand persist)
   - ✅ All API errors handled properly
   - ✅ TypeScript with proper typing
   - ✅ True SPA with React framework

## Key Features

### Authentication
- Login with JWT tokens
- Registration with auto-login
- Token storage with Zustand persist
- Protected routes
- Auto-logout on 401 errors

### Hotel Search
- Search by country, city, district
- Date-based availability
- Guest count filtering
- Price range filtering
- Pet-friendly filtering
- Real-time search results

### Booking Flow
1. Search hotels
2. Select room
3. Confirm booking details
4. Create reservation
5. View in "My Reservations"

### State Management
- Global auth state with Zustand
- Persistent auth across page refreshes
- React Query for server state caching

### Error Handling
- Axios interceptors for global error handling
- Toast notifications for user feedback
- Loading skeletons for better UX
- Graceful error recovery

## Future Enhancements

- Payment integration (Stripe)
- Hotel owner dashboard
- Admin panel
- Image uploads
- Reviews and ratings
- Advanced filtering
- Internationalization

])
```
