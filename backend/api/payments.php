<?php
// Disable error reporting to prevent HTML output interfering with JSON responses
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../models/Booking.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../config/database.php';

class PaymentAPI {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function addPayment($booking_id) {
        // Get posted data
        $json = file_get_contents("php://input");
        $data = json_decode($json);
        
        // Validate required fields
        if (!isset($data->amount) || $data->amount <= 0) {
            sendError('Amount is required and must be greater than 0', 400);
            return;
        }

        // Create booking instance
        $booking = new Booking($this->conn);
        
        // Add payment
        $payment_date = isset($data->date) ? $data->date : date('Y-m-d');
        $payment_method = isset($data->method) ? $data->method : 'Cash';
        
        if ($booking->addPayment($booking_id, $data->amount, $payment_date, $payment_method)) {
            // Update the booking's advance amount
            $stmt = $booking->getById($booking_id);
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Format booking data
                $booking_item = formatBookingResponse($row);
                
                // Get menu items
                $booking_item['menuItems'] = $booking->getMenuItems($booking_id);
                
                // Get payments
                $booking_item['payments'] = $booking->getPayments($booking_id);
                
                sendResponse($booking_item);
            } else {
                sendError('Failed to retrieve updated booking', 500);
            }
        } else {
            sendError('Unable to add payment', 500);
        }
    }

    // Get payments for a booking
    public function getPayments($booking_id) {
        // Create booking instance
        $booking = new Booking($this->conn);
        
        // Get payments
        $payments = $booking->getPayments($booking_id);
        
        sendResponse(['payments' => $payments]);
    }
}
?>