<?php
require_once __DIR__ . '/../models/Booking.php';

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
            extract($row);
            
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
        $data = json_decode(file_get_contents("php://input"));

        // Create booking instance
        $booking = new Booking($this->conn);
        
        // Set booking properties
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
        // Balance is calculated, not sent from frontend
        $booking->balance = $data->totalCost - ($data->advance ?? 0);
        $booking->dj_charges = $data->djCharges;
        $booking->decor_charges = $data->decorCharges;
        $booking->tma_charges = $data->tmaCharges;
        $booking->other_charges = $data->otherCharges;
        $booking->special_notes = $data->specialNotes;

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
        $data = json_decode(file_get_contents("php://input"));

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
        // Balance is calculated, not sent from frontend
        $booking->balance = $data->totalCost - ($data->advance ?? 0);
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
}
?>