<?php
class Booking {
    private $conn;
    private $table_name = "bookings";

    public $id;
    public $function_date;
    public $guests;
    public $function_type;
    public $booking_by;
    public $address;
    public $cnic;
    public $contact_number;
    public $start_time;
    public $end_time;
    public $booking_days;
    public $booking_type;
    public $cost_per_head;
    public $fixed_rate;
    public $booking_date;
    public $total_cost;
    public $advance;
    public $balance;
    public $dj_charges;
    public $decor_charges;
    public $tma_charges;
    public $other_charges;
    public $special_notes;

    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Method to access the database connection for error reporting
    public function getConnection() {
        return $this->conn;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY function_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " SET 
            function_date=:function_date, 
            guests=:guests, 
            function_type=:function_type, 
            booking_by=:booking_by, 
            address=:address, 
            cnic=:cnic, 
            contact_number=:contact_number, 
            start_time=:start_time, 
            end_time=:end_time, 
            booking_days=:booking_days, 
            booking_type=:booking_type, 
            cost_per_head=:cost_per_head, 
            fixed_rate=:fixed_rate, 
            booking_date=:booking_date, 
            total_cost=:total_cost, 
            advance=:advance, 
            balance=:balance, 
            dj_charges=:dj_charges, 
            decor_charges=:decor_charges, 
            tma_charges=:tma_charges, 
            other_charges=:other_charges, 
            special_notes=:special_notes";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->function_date = htmlspecialchars(strip_tags($this->function_date));
        $this->guests = htmlspecialchars(strip_tags($this->guests));
        $this->function_type = htmlspecialchars(strip_tags($this->function_type));
        $this->booking_by = htmlspecialchars(strip_tags($this->booking_by));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->cnic = htmlspecialchars(strip_tags($this->cnic));
        $this->contact_number = htmlspecialchars(strip_tags($this->contact_number));
        $this->start_time = htmlspecialchars(strip_tags($this->start_time));
        $this->end_time = htmlspecialchars(strip_tags($this->end_time));
        $this->booking_days = htmlspecialchars(strip_tags($this->booking_days));
        $this->booking_type = htmlspecialchars(strip_tags($this->booking_type));
        $this->cost_per_head = htmlspecialchars(strip_tags($this->cost_per_head));
        $this->fixed_rate = htmlspecialchars(strip_tags($this->fixed_rate));
        $this->booking_date = htmlspecialchars(strip_tags($this->booking_date));
        $this->total_cost = htmlspecialchars(strip_tags($this->total_cost));
        $this->advance = htmlspecialchars(strip_tags($this->advance));
        $this->balance = htmlspecialchars(strip_tags($this->balance));
        $this->dj_charges = htmlspecialchars(strip_tags($this->dj_charges));
        $this->decor_charges = htmlspecialchars(strip_tags($this->decor_charges));
        $this->tma_charges = htmlspecialchars(strip_tags($this->tma_charges));
        $this->other_charges = htmlspecialchars(strip_tags($this->other_charges));
        $this->special_notes = htmlspecialchars(strip_tags($this->special_notes));

        // Bind values
        $stmt->bindParam(":function_date", $this->function_date);
        $stmt->bindParam(":guests", $this->guests);
        $stmt->bindParam(":function_type", $this->function_type);
        $stmt->bindParam(":booking_by", $this->booking_by);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":cnic", $this->cnic);
        $stmt->bindParam(":contact_number", $this->contact_number);
        $stmt->bindParam(":start_time", $this->start_time);
        $stmt->bindParam(":end_time", $this->end_time);
        $stmt->bindParam(":booking_days", $this->booking_days);
        $stmt->bindParam(":booking_type", $this->booking_type);
        $stmt->bindParam(":cost_per_head", $this->cost_per_head);
        $stmt->bindParam(":fixed_rate", $this->fixed_rate);
        $stmt->bindParam(":booking_date", $this->booking_date);
        $stmt->bindParam(":total_cost", $this->total_cost);
        $stmt->bindParam(":advance", $this->advance);
        $stmt->bindParam(":balance", $this->balance);
        $stmt->bindParam(":dj_charges", $this->dj_charges);
        $stmt->bindParam(":decor_charges", $this->decor_charges);
        $stmt->bindParam(":tma_charges", $this->tma_charges);
        $stmt->bindParam(":other_charges", $this->other_charges);
        $stmt->bindParam(":special_notes", $this->special_notes);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " SET 
            function_date=:function_date, 
            guests=:guests, 
            function_type=:function_type, 
            booking_by=:booking_by, 
            address=:address, 
            cnic=:cnic, 
            contact_number=:contact_number, 
            start_time=:start_time, 
            end_time=:end_time, 
            booking_days=:booking_days, 
            booking_type=:booking_type, 
            cost_per_head=:cost_per_head, 
            fixed_rate=:fixed_rate, 
            booking_date=:booking_date, 
            total_cost=:total_cost, 
            advance=:advance, 
            balance=:balance, 
            dj_charges=:dj_charges, 
            decor_charges=:decor_charges, 
            tma_charges=:tma_charges, 
            other_charges=:other_charges, 
            special_notes=:special_notes
            WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->function_date = htmlspecialchars(strip_tags($this->function_date));
        $this->guests = htmlspecialchars(strip_tags($this->guests));
        $this->function_type = htmlspecialchars(strip_tags($this->function_type));
        $this->booking_by = htmlspecialchars(strip_tags($this->booking_by));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->cnic = htmlspecialchars(strip_tags($this->cnic));
        $this->contact_number = htmlspecialchars(strip_tags($this->contact_number));
        $this->start_time = htmlspecialchars(strip_tags($this->start_time));
        $this->end_time = htmlspecialchars(strip_tags($this->end_time));
        $this->booking_days = htmlspecialchars(strip_tags($this->booking_days));
        $this->booking_type = htmlspecialchars(strip_tags($this->booking_type));
        $this->cost_per_head = htmlspecialchars(strip_tags($this->cost_per_head));
        $this->fixed_rate = htmlspecialchars(strip_tags($this->fixed_rate));
        $this->booking_date = htmlspecialchars(strip_tags($this->booking_date));
        $this->total_cost = htmlspecialchars(strip_tags($this->total_cost));
        $this->advance = htmlspecialchars(strip_tags($this->advance));
        $this->balance = htmlspecialchars(strip_tags($this->balance));
        $this->dj_charges = htmlspecialchars(strip_tags($this->dj_charges));
        $this->decor_charges = htmlspecialchars(strip_tags($this->decor_charges));
        $this->tma_charges = htmlspecialchars(strip_tags($this->tma_charges));
        $this->other_charges = htmlspecialchars(strip_tags($this->other_charges));
        $this->special_notes = htmlspecialchars(strip_tags($this->special_notes));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind values
        $stmt->bindParam(":function_date", $this->function_date);
        $stmt->bindParam(":guests", $this->guests);
        $stmt->bindParam(":function_type", $this->function_type);
        $stmt->bindParam(":booking_by", $this->booking_by);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":cnic", $this->cnic);
        $stmt->bindParam(":contact_number", $this->contact_number);
        $stmt->bindParam(":start_time", $this->start_time);
        $stmt->bindParam(":end_time", $this->end_time);
        $stmt->bindParam(":booking_days", $this->booking_days);
        $stmt->bindParam(":booking_type", $this->booking_type);
        $stmt->bindParam(":cost_per_head", $this->cost_per_head);
        $stmt->bindParam(":fixed_rate", $this->fixed_rate);
        $stmt->bindParam(":booking_date", $this->booking_date);
        $stmt->bindParam(":total_cost", $this->total_cost);
        $stmt->bindParam(":advance", $this->advance);
        $stmt->bindParam(":balance", $this->balance);
        $stmt->bindParam(":dj_charges", $this->dj_charges);
        $stmt->bindParam(":decor_charges", $this->decor_charges);
        $stmt->bindParam(":tma_charges", $this->tma_charges);
        $stmt->bindParam(":other_charges", $this->other_charges);
        $stmt->bindParam(":special_notes", $this->special_notes);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);
        return $stmt->execute();
    }

    // Menu items functions
    public function getMenuItems($booking_id) {
        $query = "SELECT menu_item FROM booking_menu_items WHERE booking_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $booking_id);
        $stmt->execute();
        $menuItems = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $menuItems[] = $row['menu_item'];
        }
        return $menuItems;
    }

    public function addMenuItems($booking_id, $menuItems) {
        // First delete existing menu items for this booking
        $deleteQuery = "DELETE FROM booking_menu_items WHERE booking_id = ?";
        $deleteStmt = $this->conn->prepare($deleteQuery);
        $deleteStmt->bindParam(1, $booking_id);
        $deleteStmt->execute();

        // Then add new menu items
        foreach ($menuItems as $item) {
            $query = "INSERT INTO booking_menu_items SET booking_id=:booking_id, menu_item=:menu_item";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":booking_id", $booking_id);
            $stmt->bindParam(":menu_item", $item);
            $stmt->execute();
        }
    }

    // Payments functions
    public function getPayments($booking_id) {
        $query = "SELECT * FROM booking_payments WHERE booking_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $booking_id);
        $stmt->execute();
        $payments = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $payments[] = [
                'amount' => (float)$row['amount'],
                'date' => $row['payment_date'],
                'method' => $row['payment_method']
            ];
        }
        return $payments;
    }

    public function addPayments($booking_id, $payments) {
        // First delete existing payments for this booking
        $deleteQuery = "DELETE FROM booking_payments WHERE booking_id = ?";
        $deleteStmt = $this->conn->prepare($deleteQuery);
        $deleteStmt->bindParam(1, $booking_id);
        $deleteStmt->execute();

        // Then add new payments
        foreach ($payments as $payment) {
            // Check if this is a valid payment with required fields
            if (!isset($payment['amount']) || $payment['amount'] <= 0) {
                continue;
            }
            
            $query = "INSERT INTO booking_payments SET 
                booking_id=:booking_id, 
                amount=:amount, 
                payment_date=:payment_date, 
                payment_method=:payment_method";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":booking_id", $booking_id);
            
            // Check if the required keys exist and convert to proper types
            $amount = isset($payment['amount']) ? floatval($payment['amount']) : 0;
            // Handle the date format - convert ISO date to MySQL date format
            $payment_date_raw = isset($payment['date']) ? $payment['date'] : date('Y-m-d');
            // Convert ISO date string to MySQL date format
            if (strpos($payment_date_raw, 'T') !== false) {
                // Extract just the date part from ISO format
                $payment_date = substr($payment_date_raw, 0, 10);
            } else {
                $payment_date = $payment_date_raw;
            }
            $payment_method = isset($payment['method']) ? strval($payment['method']) : 'Cash';
            
            $stmt->bindParam(":amount", $amount);
            $stmt->bindParam(":payment_date", $payment_date);
            $stmt->bindParam(":payment_method", $payment_method);
            
            $stmt->execute();
        }
    }
}
?>