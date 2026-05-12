# 🔧 Smart Local Service Finder & Booking System

Full-stack web application — React + Node.js + Express + MongoDB

---

## 📁 Project Structure

```
service-finder/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ServiceCard.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── ServiceDetailPage.js
    │   │   ├── BookingPage.js
    │   │   ├── CustomerDashboard.js
    │   │   ├── ProviderDashboard.js
    │   │   └── AdminPanel.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

Edit `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/service_finder
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

**For MongoDB Atlas (cloud):**
Replace MONGO_URI with your Atlas connection string:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/service_finder
```

Start backend:
```bash
npm run dev    # with nodemon (recommended)
# OR
npm start      # without nodemon
```

✅ Backend runs on: `http://localhost:5000`

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

✅ Frontend runs on: `http://localhost:3000`

---

### 3️⃣ Create Admin User

Use MongoDB shell or Compass to manually set one user as admin:

```js
// In MongoDB shell
use service_finder
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or register a user normally, then update their role to `admin` in the database.

---

## 🔗 API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/profile | Private |
| PUT | /api/auth/profile | Private |
| GET | /api/services | Public |
| GET | /api/services/:id | Public |
| GET | /api/services/provider/my-services | Provider |
| POST | /api/services | Provider |
| PUT | /api/services/:id | Provider (own) |
| DELETE | /api/services/:id | Provider (own) |
| GET | /api/bookings | Private |
| POST | /api/bookings | Customer |
| PUT | /api/bookings/:id/status | Private |
| GET | /api/reviews/:serviceId | Public |
| POST | /api/reviews/:serviceId | Customer |
| GET | /api/admin/stats | Admin |
| GET | /api/admin/users | Admin |
| PUT | /api/admin/users/:id/toggle | Admin |
| DELETE | /api/admin/services/:id | Admin |

---

## ✨ Features

### Customer
- Register / Login
- Browse & search services
- Filter by category, location, price, rating
- View service details
- Book a service (date + time)
- View & cancel bookings
- Write reviews & ratings

### Service Provider
- Register as provider
- Add, edit, delete services
- Toggle service availability
- View incoming bookings
- Accept / Reject / Complete bookings

### Admin
- View overall stats dashboard
- Manage all users (activate/deactivate)
- Manage all services (delete)
- Overview of platform activity

---

## 🗃️ Database Schema

### Users
```json
{
  "name": "string",
  "email": "string (unique)",
  "password": "hashed",
  "role": "customer | provider | admin",
  "phone": "string",
  "location": "string",
  "isActive": "boolean"
}
```

### Services
```json
{
  "title": "string",
  "category": "Electrician | Plumber | ...",
  "price": "number",
  "location": "string",
  "description": "string",
  "provider": "ref: User",
  "isAvailable": "boolean",
  "averageRating": "number",
  "totalReviews": "number"
}
```

### Bookings
```json
{
  "customer": "ref: User",
  "service": "ref: Service",
  "bookingDate": "Date",
  "bookingTime": "string",
  "status": "Pending | Accepted | Completed | Cancelled",
  "notes": "string",
  "totalAmount": "number"
}
```

### Reviews
```json
{
  "customer": "ref: User",
  "service": "ref: Service",
  "rating": "1-5",
  "comment": "string"
}
```

---

## 🔐 Auth Flow

1. Register → JWT token returned → stored in localStorage
2. All protected routes use `Authorization: Bearer <token>` header
3. Token expires in 30 days

---

## 🛠️ Tech Stack

- **Frontend:** React 18, React Router v6, Axios, react-hot-toast
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Auth:** JWT + bcryptjs
- **Fonts:** Syne + DM Sans (Google Fonts)
