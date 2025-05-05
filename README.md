<div align="center">
  
# 🗓️ AppointMate

### Modern Appointment Booking System for Salons and Clinics

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.x-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18.0-000000?logo=express)](https://expressjs.com/)

<p>
  <img src="https://user-images.githubusercontent.com/your-username/your-repo/raw/main/demo/preview.png" alt="AppointMate Preview" width="650px">
</p>

</div>

## 📋 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Overview

AppointMate is a comprehensive web-based appointment booking solution specifically designed for salons, clinics, and service providers. The platform streamlines the appointment scheduling process, allowing businesses to manage their calendars efficiently while providing customers with an intuitive interface to book services.

This application solves several key challenges faced by service-based businesses:
- Reducing scheduling conflicts and double bookings
- Minimizing no-shows through automated reminders
- Providing 24/7 booking capabilities without staff intervention
- Streamlining business operations and resource management

## ✨ Key Features

### For Customers
- **Easy Service Discovery**: Browse local businesses with filtering by service type, location, and availability
- **Real-time Availability**: See available time slots instantly with calendar integration
- **Seamless Booking Experience**: Book appointments in just a few clicks without creating an account
- **Booking Management**: View, reschedule, or cancel appointments with a unique token
- **Automated Reminders**: Receive booking confirmations and reminders via email/SMS

### For Vendors (Business Owners)
- **Business Profile Management**: Customize profile, services, pricing, and availability
- **Smart Scheduling System**: Define working hours, staff availability, and break times
- **Calendar Integration**: Sync with Google/Apple calendar to avoid double bookings
- **Booking Analytics**: Track appointments, popular services, and customer patterns
- **Staff Management**: Add team members with individual schedules and service capabilities
- **Automated Notifications**: Send customizable reminders to reduce no-shows

## 💻 Technology Stack

### Frontend
- **React.js**: Component-based UI development with hooks
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Redux Toolkit**: State management across components
- **React Router**: Navigation and routing
- **Axios**: API communication
- **Formik & Yup**: Form handling and validation
- **Full Calendar**: Interactive calendar interface

### Backend
- **Node.js**: Runtime environment
- **Express**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication and authorization
- **Nodemailer**: Email notifications
- **Twilio**: SMS notifications (optional)
- **Stripe**: Payment processing integration

### DevOps & Tools
- **Git**: Version control
- **Jest**: Testing framework
- **Docker**: Containerization
- **Postman**: API testing
- **Heroku/Vercel**: Deployment platforms

## 🏗️ System Architecture

The system follows a modern microservices architecture:

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│    Client Side   │      │    Server Side   │      │    Data Layer    │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│  - React.js      │      │  - Express.js    │      │  - MongoDB       │
│  - Redux         │◄────►│  - Node.js       │◄────►│  - Mongoose      │
│  - Tailwind CSS  │      │  - RESTful APIs  │      │  - Aggregations  │
│  - React Router  │      │  - JWT Auth      │      │  - Indexing      │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

## 🔧 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (v6+)
- npm or yarn

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/appointment-booking-system.git
cd appointment-booking-system/backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env file with your configuration

# Start the server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## 📱 Usage

### Customer Flow
1. **Browse Providers**: Visit the homepage to explore available businesses
2. **Select a Provider**: Browse through provider profiles and service offerings
3. **Choose a Service**: Select desired service(s) from the provider's menu
4. **Pick Date & Time**: View available slots and select preferred appointment time
5. **Enter Details**: Provide contact information for booking confirmation
6. **Confirm Booking**: Review details and confirm the appointment
7. **Receive Confirmation**: Get booking confirmation with a unique token

### Vendor Flow
1. **Register/Login**: Create an account or log in to the vendor portal
2. **Configure Profile**: Set up business information, services, and pricing
3. **Define Availability**: Set working hours, breaks, and staff schedules
4. **Manage Bookings**: View upcoming appointments and booking history
5. **Handle Scheduling**: Accept, reschedule, or cancel appointments
6. **View Analytics**: Track business performance and customer patterns

## 📁 Project Structure

```
appointment-booking-system/
├── backend/                # Backend code
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── server.js           # Entry point
│
├── frontend/               # Frontend code
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main component
│   │   └── index.js        # Entry point
│   └── package.json        # Dependencies
│
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
└── package.json            # Root dependencies
```

## 📚 API Documentation

The system exposes RESTful APIs for various operations:

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify authentication token

### Customer Endpoints
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/:id` - Get vendor details
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:token` - Get booking by token
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Vendor Endpoints
- `GET /api/vendor/dashboard` - Get vendor dashboard data
- `GET /api/vendor/bookings` - Get vendor's bookings
- `PUT /api/vendor/profile` - Update vendor profile
- `POST /api/vendor/services` - Add new service
- `PUT /api/vendor/services/:id` - Update service
- `DELETE /api/vendor/services/:id` - Delete service

## 📸 Screenshots

<div align="center">
  <img src="https://user-images.githubusercontent.com/your-username/your-repo/raw/main/demo/screenshot1.png" alt="Dashboard" width="400">
  <img src="https://user-images.githubusercontent.com/your-username/your-repo/raw/main/demo/screenshot2.png" alt="Booking Page" width="400">
  <p><em>Left: Vendor Dashboard | Right: Customer Booking Interface</em></p>
</div>

## 🔮 Future Enhancements

- **Mobile Application**: Native iOS and Android apps
- **AI-Powered Scheduling**: Smart suggestions based on customer preferences
- **Analytics Dashboard**: Enhanced business intelligence features
- **Multi-language Support**: Localization for global reach
- **Resource Allocation**: Equipment and room booking capabilities
- **Loyalty Program**: Customer rewards and referral system

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <p>Developed by Shaswat Prasad</p>
  <p>
    <a href="mailto:prasadshaswat9265@gmail.com">prasadshaswat9265@gmail.com</a> | 
    <a href="tel:+919265318481">+91 9265318481</a>
  </p>
</div>
