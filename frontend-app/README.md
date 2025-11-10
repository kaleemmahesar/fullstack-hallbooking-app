# Wedding Hall Management System

A comprehensive wedding hall management application built with React, Vite, and Redux Toolkit. This system allows wedding hall owners to record and manage customer bookings, menu details, expenses, and profits.

## Features

### 🧾 Customer Booking Management
- Formik-based form for booking details
- Dynamic menu items section with repeater field
- Auto-calculations for total cost and balance
- Validation with Yup

### 💰 Expense Tracking
- Per-booking expense management
- Add, edit, and delete expenses
- Expense summary with totals

### 📋 Order Summary
- List of all bookings with essential information
- View, edit, and delete bookings
- Expense management integration

### 📊 Dashboard & Reporting
- Visual overview of key metrics
- Total bookings, revenue, expenses, and profit
- Filterable reports by date range and customer
- PDF report generation

### 🖨️ Booking Slips
- Printable booking receipts
- PDF download functionality
- Professional formatting for printing

## Technology Stack

- **Frontend**: React with Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Forms**: Formik with Yup validation
- **UI Components**: Custom reusable components
- **PDF Generation**: jsPDF
- **Notifications**: react-hot-toast
- **Persistence**: localStorage

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Navigate to the application in your browser
2. Use the dashboard to view overall statistics
3. Add new bookings through the "Add New Booking" button
4. Manage expenses for each booking
5. Generate reports and download as PDF

## Project Structure

```
src/
├── api/          # Mock API functions
├── components/   # Reusable UI components
├── models/       # Data models
├── pages/        # Page components
├── services/     # Business logic services
├── store/        # Redux store and slices
├── utils/        # Utility functions
└── App.jsx       # Main application component
```

## Key Components

- **DashboardPage**: Overview of bookings, revenue, and expenses
- **BookingFormPage**: Form for creating and editing bookings
- **OrderSummaryPage**: List view of all bookings with actions
- **ExpenseManagement**: Component for managing booking expenses
- **BookingSlip**: Printable receipt for bookings

## Data Persistence

The application uses localStorage to persist data between sessions, simulating a backend database.

## Future Enhancements

- Integration with a real backend API
- User authentication and authorization
- Advanced reporting features
- Mobile-responsive design
- Multi-language support

## License

This project is licensed under the MIT License."# wedding-halls-management" 
