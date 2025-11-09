<?php
class Expense {
    private $conn;
    private $table_name = "expenses";

    public $id;
    public $booking_id;
    public $vendor_id;
    public $title;
    public $category;
    public $amount;
    public $receipt_image;
    public $payment_status;
    public $due_date;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getByBookingId($booking_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE booking_id = ? ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $booking_id);
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
            booking_id=:booking_id,
            vendor_id=:vendor_id,
            title=:title,
            category=:category,
            amount=:amount,
            receipt_image=:receipt_image,
            payment_status=:payment_status,
            due_date=:due_date";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->booking_id = htmlspecialchars(strip_tags($this->booking_id));
        $this->vendor_id = htmlspecialchars(strip_tags($this->vendor_id));
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->category = htmlspecialchars(strip_tags($this->category));
        $this->amount = htmlspecialchars(strip_tags($this->amount));
        $this->receipt_image = htmlspecialchars(strip_tags($this->receipt_image));
        $this->payment_status = htmlspecialchars(strip_tags($this->payment_status));
        $this->due_date = htmlspecialchars(strip_tags($this->due_date));

        // Bind values
        $stmt->bindParam(":booking_id", $this->booking_id);
        $stmt->bindParam(":vendor_id", $this->vendor_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":amount", $this->amount);
        $stmt->bindParam(":receipt_image", $this->receipt_image);
        $stmt->bindParam(":payment_status", $this->payment_status);
        $stmt->bindParam(":due_date", $this->due_date);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " SET 
            booking_id=:booking_id,
            vendor_id=:vendor_id,
            title=:title,
            category=:category,
            amount=:amount,
            receipt_image=:receipt_image,
            payment_status=:payment_status,
            due_date=:due_date
            WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->booking_id = htmlspecialchars(strip_tags($this->booking_id));
        $this->vendor_id = htmlspecialchars(strip_tags($this->vendor_id));
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->category = htmlspecialchars(strip_tags($this->category));
        $this->amount = htmlspecialchars(strip_tags($this->amount));
        $this->receipt_image = htmlspecialchars(strip_tags($this->receipt_image));
        $this->payment_status = htmlspecialchars(strip_tags($this->payment_status));
        $this->due_date = htmlspecialchars(strip_tags($this->due_date));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind values
        $stmt->bindParam(":booking_id", $this->booking_id);
        $stmt->bindParam(":vendor_id", $this->vendor_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":amount", $this->amount);
        $stmt->bindParam(":receipt_image", $this->receipt_image);
        $stmt->bindParam(":payment_status", $this->payment_status);
        $stmt->bindParam(":due_date", $this->due_date);
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

    // Payment history functions
    public function getPaymentHistory($expense_id) {
        $query = "SELECT * FROM expense_payment_history WHERE expense_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $expense_id);
        $stmt->execute();
        $paymentHistory = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $paymentHistory[] = [
                'amount' => (float)$row['amount'],
                'paymentDate' => $row['payment_date'],
                'paymentMethod' => $row['payment_method']
            ];
        }
        return $paymentHistory;
    }

    public function addPaymentHistory($expense_id, $paymentHistory) {
        // First delete existing payment history for this expense
        $deleteQuery = "DELETE FROM expense_payment_history WHERE expense_id = ?";
        $deleteStmt = $this->conn->prepare($deleteQuery);
        $deleteStmt->bindParam(1, $expense_id);
        $deleteStmt->execute();

        // Then add new payment history
        foreach ($paymentHistory as $payment) {
            $query = "INSERT INTO expense_payment_history SET 
                expense_id=:expense_id, 
                amount=:amount, 
                payment_date=:payment_date, 
                payment_method=:payment_method";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":expense_id", $expense_id);
            $stmt->bindParam(":amount", $payment['amount']);
            $stmt->bindParam(":payment_date", $payment['paymentDate']);
            $stmt->bindParam(":payment_method", $payment['paymentMethod']);
            $stmt->execute();
        }
    }
}
?>