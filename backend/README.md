# Hall Booking Application - PHP MySQL Backend

## Database Setup

1. Create a MySQL database named `hall_booking`
2. Execute the SQL script in `database_schema.sql` to create all tables
3. The default user is `admin` with password `password`

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/{id}` - Get a specific booking
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/{id}` - Update a booking
- `DELETE /api/bookings/{id}` - Delete a booking

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/booking/{bookingId}` - Get expenses for a specific booking
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses` - Update an expense
- `DELETE /api/expenses/{id}` - Delete an expense

### Vendors
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create a new vendor
- `PUT /api/vendors/{id}` - Update a vendor
- `DELETE /api/vendors/{id}` - Delete a vendor

### Vendor Transactions
- `GET /api/vendor-transactions/{vendorId}` - Get transactions for a vendor
- `POST /api/vendor-transactions` - Create a new transaction

## Configuration

Update the database connection settings in `config/database.php`:
- Host: `localhost`
- Database name: `hall_booking`
- Username: `root`
- Password: (empty by default)

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- PDO extension enabled