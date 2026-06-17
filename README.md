# 🚖 RideBeacon Frontend

RideBeacon is a modern ride-booking and driver management platform that connects passengers and drivers through a real-time, location-aware transportation system.

The frontend provides an intuitive user experience for booking rides, tracking drivers in real time, managing payments, reviewing ride history, and rating completed trips.

Built with React, Vite, Tailwind CSS, Google Maps, and Socket.IO, RideBeacon delivers a responsive and interactive ride-hailing experience.

---

## 🔗 Project Links

* 🌐 Live Demo: https://ridebeacon-frontend.vercel.app/
* 🎨 Frontend Repository: https://github.com/shaikakhila26/ridebeacon-frontend
* ⚙️ Backend Repository: https://github.com/shaikakhila26/ridebeacon-backend

---

## ✨ Features

### 👤 Passenger Features

* User registration and authentication
* Secure login and account management
* Book rides using pickup and destination locations
* Live ride tracking
* Real-time driver updates
* Ride history management
* Online payment processing
* Rate and review drivers
* Profile management

### 🚗 Driver Features

* Driver dashboard
* Accept or reject ride requests
* Real-time location sharing
* View active rides
* Ride history tracking
* Passenger information access
* Driver profile management
* Ratings and review system

### 🗺️ Real-Time Tracking

* Google Maps integration
* Live driver location updates
* Route visualization
* Pickup and destination markers
* Dynamic ride status tracking

### 💳 Payment System

* Stripe payment integration
* Secure payment processing
* Payment status tracking
* Success and failure handling

### 🔔 Notifications

* Ride request notifications
* Ride status updates
* Payment confirmations
* Driver assignment alerts

---

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* React Router DOM
* Tailwind CSS
* Axios
* Socket.IO Client
* React Icons
* Lucide React

### Backend

* Node
* Express
* Supabase
* Socket.IO
* JWT Authentication

### Maps & Location

* Google Maps API
* @react-google-maps/api
* Polyline Routing

### Authentication & Database

* Supabase Authentication
* Supabase Client

### Payments

* Stripe
* React Stripe Integration

---
## 🏗️ Architecture

```text
Passenger / Driver
        ↓
 React Frontend
        ↓
 Socket.IO + REST APIs
        ↓
 Node.js + Express Backend
        ↓
 Supabase Database
        ↓
 Google Maps + Stripe Services
```

---

## 📂 Project Structure

```text
src/
│
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── MapView.jsx
│   ├── PaymentModal.jsx
│   ├── DriverProfile.jsx
│   ├── DriverReviews.jsx
│   ├── DriverAverageRating.jsx
│   ├── RateDriverModal.jsx
│   └── Toasts.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── UserDashboard.jsx
│   ├── DriverDashboard.jsx
│   ├── DriverTripHistoryPage.jsx
│   ├── DriverTripDetailPage.jsx
│   ├── About.jsx
│   ├── StripeSuccess.jsx
│   └── StripeFailed.jsx
│
├── lib/
│   ├── socket.js
│   └── supabaseClient.js
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/shaikakhila26/ridebeacon-frontend.git

cd ridebeacon-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000

VITE_SUPABASE_URL=your_supabase_url

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Start Development Server

```bash
npm run dev
```

Application will run on:

```text
http://localhost:5173
```

---

## 🔗 Backend Integration

The frontend communicates with the backend for:

* Authentication
* Ride booking
* Driver assignment
* Ride management
* Real-time location updates
* Payment processing
* Driver ratings and reviews
* Notifications

---

## 🚖 User Workflow

1. Register or Login
2. Select Pickup Location
3. Select Destination
4. Request Ride
5. Driver Accepts Request
6. Track Driver in Real Time
7. Complete Ride
8. Make Payment
9. Rate Driver

---

## 📊 Key Highlights

* Real-time ride booking platform
* Google Maps integration
* Live driver tracking
* Stripe payment gateway
* Driver rating and review system
* Socket.IO real-time communication
* Supabase authentication
* Responsive mobile-friendly UI
* Modern dashboard experience

---
## 💡 What Makes RideBeacon Unique?

* Real-time ride tracking using Socket.IO
* Google Maps powered navigation and route visualization
* Secure Stripe payment integration
* Dual-role architecture for passengers and drivers
* Driver rating and review ecosystem
* Scalable full-stack architecture using React, Express, and Supabase
* Responsive and modern user experience

---

## 🚀 Future Enhancements

* Ride scheduling
* Fare estimation
* Driver verification system
* Emergency SOS feature
* In-app chat
* Multi-language support
* Dark mode
* Ride analytics dashboard
* Push notifications

---


## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 👨‍💻 Author

**Shaik Akhila**

* GitHub: https://github.com/shaikakhila26
* LinkedIn: https://www.linkedin.com/in/akhila-shaik-8100b2344/
* Email: [akhilashaik2605@gmail.com](mailto:akhilashaik2605@gmail.com)

---

⭐ If you found this project useful, consider giving it a star on GitHub.
