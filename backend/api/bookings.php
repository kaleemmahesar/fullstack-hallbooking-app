<?php
// Disable error reporting to prevent HTML output interfering with JSON responses
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../models/Booking.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../config/database.php';

class BookingAPI {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        // Create booking instance
        $booking = new Booking($this->conn);
        
        // Get all bookings
        $stmt = $booking->getAll();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $bookings_arr = array();
            $bookings_arr["data"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                // Format booking data
                $booking_item = formatBookingResponse($row);
                
                // Get menu items
                $booking_item['menuItems'] = $booking->getMenuItems($id);
                
                // Get payments
                $booking_item['payments'] = $booking->getPayments($id);
                
                $bookings_arr["data"][] = $booking_item;
            }

            sendResponse($bookings_arr);
        } else {
            sendResponse(["data" => []]);
        }
    }

    public function getById($id) {
        // Create booking instance
        $booking = new Booking($this->conn);
        
        // Get booking by ID
        $stmt = $booking->getById($id);
        $num = $stmt->rowCount();

        if ($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format booking data
            $booking_item = formatBookingResponse($row);
            
            // Get menu items
            $booking_item['menuItems'] = $booking->getMenuItems($id);
            
            // Get payments
            $booking_item['payments'] = $booking->getPayments($id);
            
            sendResponse($booking_item);
        } else {
            sendError('Booking not found', 404);
        }
    }

    public function create() {
        // Get posted data
        $json = file_get_contents("php://input");
        $data = json_decode($json);
        
        // Check if JSON parsing was successful
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('Invalid JSON data: ' . json_last_error_msg(), 400);
            return;
        }
        
        // Check if required fields are present
        if (!isset($data->functionDate) || !isset($data->functionType) || !isset($data->bookingBy)) {
            sendError('Function date, function type, and booking by are required', 400);
            return;
        }

        // Create booking instance
        $booking = new Booking($this->conn);
        
        // Set booking properties
        $booking->function_date = $data->functionDate;
        $booking->guests = $data->guests ?? 0;
        $booking->function_type = $data->functionType;
        $booking->booking_by = $data->bookingBy;
        $booking->address = $data->address ?? '';
        $booking->cnic = $data->cnic ?? '';
        $booking->contact_number = $data->contactNumber ?? '';
        $booking->start_time = $data->startTime ?? '';
        $booking->end_time = $data->endTime ?? '';
        $booking->booking_days = $data->bookingDays ?? 1;
        $booking->booking_type = $data->bookingType ?? 'perHead';
        $booking->cost_per_head = $data->costPerHead ?? 0;
        $booking->fixed_rate = $data->fixedRate ?? 0;
        $booking->booking_date = $data->bookingDate ?? date('Y-m-d');
        $booking->total_cost = $data->totalCost ?? 0;
        $booking->advance = $data->advance ?? 0;
        $booking->balance = ($data->totalCost ?? 0) - ($data->advance ?? 0); // Calculate balance
        $booking->dj_charges = $data->djCharges ?? 0;
        $booking->decor_charges = $data->decorCharges ?? 0;
        $booking->tma_charges = $data->tmaCharges ?? 0;
        $booking->other_charges = $data->otherCharges ?? 0;
        $booking->special_notes = $data->specialNotes ?? '';

        // Create booking
        if ($booking->create()) {
            // Add menu items if provided
            if (isset($data->menuItems) && is_array($data->menuItems)) {
                $booking->addMenuItems($booking->id, $data->menuItems);
            }
            
            // Add payments if provided
            if (isset($data->payments) && is_array($data->payments)) {
                $booking->addPayments($booking->id, $data->payments);
            }
            
            // Get the created booking with menu items and payments
            $stmt = $booking->getById($booking->id);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format booking data
            $booking_item = formatBookingResponse($row);
            
            // Get menu items
            $booking_item['menuItems'] = $booking->getMenuItems($booking->id);
            
            // Get payments
            $booking_item['payments'] = $booking->getPayments($booking->id);
            
            sendResponse($booking_item, 201);
        } else {
            sendError('Unable to create booking', 500);
        }
    }

    public function update($id) {
        // Get posted data
        $json = file_get_contents("php://input");
        $data = json_decode($json);
        
        // Log the received data for debugging
        error_log("Booking update data: " . $json);

        // Create booking instance
        $booking = new Booking($this->conn);
        
        // Set booking properties
        $booking->id = $id;
        $booking->function_date = $data->functionDate;
        $booking->guests = $data->guests;
        $booking->function_type = $data->functionType;
        $booking->booking_by = $data->bookingBy;
        $booking->address = $data->address;
        $booking->cnic = $data->cnic;
        $booking->contact_number = $data->contactNumber;
        $booking->start_time = $data->startTime;
        $booking->end_time = $data->endTime;
        $booking->booking_days = $data->bookingDays;
        $booking->booking_type = $data->bookingType;
        $booking->cost_per_head = $data->costPerHead;
        $booking->fixed_rate = $data->fixedRate;
        $booking->booking_date = $data->bookingDate;
        $booking->total_cost = $data->totalCost;
        $booking->advance = $data->advance;
        // Balance should be calculated as total_cost - advance
        $booking->balance = $data->totalCost - $data->advance;
        $booking->dj_charges = $data->djCharges;
        $booking->decor_charges = $data->decorCharges;
        $booking->tma_charges = $data->tmaCharges;
        $booking->other_charges = $data->otherCharges;
        $booking->special_notes = $data->specialNotes;

        // Update booking
        if ($booking->update()) {
            // Add menu items if provided
            if (isset($data->menuItems) && is_array($data->menuItems)) {
                $booking->addMenuItems($booking->id, $data->menuItems);
            }
            
            // Add payments if provided
            if (isset($data->payments) && is_array($data->payments)) {
                $booking->addPayments($booking->id, $data->payments);
            }
            
            // Get the updated booking with menu items and payments
            $stmt = $booking->getById($booking->id);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format booking data
            $booking_item = formatBookingResponse($row);
            
            // Get menu items
            $booking_item['menuItems'] = $booking->getMenuItems($booking->id);
            
            // Get payments
            $booking_item['payments'] = $booking->getPayments($booking->id);
            
            sendResponse($booking_item);
        } else {
            sendError('Unable to update booking', 500);
        }
    }

    public function delete($id) {
        // Create booking instance
        $booking = new Booking($this->conn);
        
        // Set booking ID
        $booking->id = $id;

        // Delete booking
        if ($booking->delete()) {
            sendResponse(['message' => 'Booking deleted successfully']);
        } else {
            sendError('Unable to delete booking', 500);
        }
    }
    
    public function addPayment($id) {
        // This method is now handled by the PaymentAPI
        sendError('This endpoint is deprecated. Use /api/bookings/{id}/payments instead.', 400);
    }
}
?>