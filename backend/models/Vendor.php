<?php
class Vendor {
    private $conn;
    private $table_name = "vendors";

    public $id;
    public $name;
    public $contact_person;
    public $phone;
    public $email;
    public $address;
    public $total_credit;
    public $total_paid;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY name ASC";
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
            name=:name,
            contact_person=:contact_person,
            phone=:phone,
            email=:email,
            address=:address,
            total_credit=:total_credit,
            total_paid=:total_paid";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->contact_person = htmlspecialchars(strip_tags($this->contact_person));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->address = htmlspecialchars(strip_tags($this->address));
        // Ensure totals are properly formatted as floats, default to 0
        $this->total_credit = (float)($this->total_credit ?? 0);
        $this->total_paid = (float)($this->total_paid ?? 0);

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":contact_person", $this->contact_person);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":total_credit", $this->total_credit);
        $stmt->bindParam(":total_paid", $this->total_paid);

        error_log("Creating vendor with name: " . $this->name . ", credit: " . $this->total_credit . ", paid: " . $this->total_paid);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            error_log("Successfully created vendor with ID: " . $this->id);
            return true;
        }
        
        error_log("Failed to create vendor");
        $errorInfo = $stmt->errorInfo();
        error_log("Database error: " . print_r($errorInfo, true));
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " SET 
            name=:name,
            contact_person=:contact_person,
            phone=:phone,
            email=:email,
            address=:address,
            total_credit=:total_credit,
            total_paid=:total_paid
            WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->contact_person = htmlspecialchars(strip_tags($this->contact_person));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->address = htmlspecialchars(strip_tags($this->address));
        // Ensure totals are properly formatted as floats
        $this->total_credit = (float)$this->total_credit;
        $this->total_paid = (float)$this->total_paid;
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":contact_person", $this->contact_person);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":total_credit", $this->total_credit);
        $stmt->bindParam(":total_paid", $this->total_paid);
        $stmt->bindParam(":id", $this->id);

        error_log("Updating vendor " . $this->id . " with credit: " . $this->total_credit . ", paid: " . $this->total_paid);
        
        $result = $stmt->execute();
        
        if ($result) {
            error_log("Successfully updated vendor " . $this->id);
        } else {
            error_log("Failed to update vendor " . $this->id);
            $errorInfo = $stmt->errorInfo();
            error_log("Database error: " . print_r($errorInfo, true));
        }
        
        return $result;
    }

    // Check if vendor has transactions
    public function hasTransactions($vendor_id) {
        $query = "SELECT COUNT(*) as transaction_count FROM vendor_transactions WHERE vendor_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $vendor_id);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['transaction_count'] > 0;
    }

    public function delete() {
        // Check if vendor has transactions
        if ($this->hasTransactions($this->id)) {
            // Don't delete if vendor has transactions
            return false;
        }
        
        // Delete the vendor itself (no transactions to delete)
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);
        return $stmt->execute();
    }

    // Transaction functions
    public function getTransactions($vendor_id) {
        $query = "SELECT * FROM vendor_transactions WHERE vendor_id = ? ORDER BY transaction_date DESC, id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $vendor_id);
        $stmt->execute();
        return $stmt;
    }

    public function addTransaction($transactionData) {
        // If balance_after is not provided or is 0, calculate it
        if (!isset($transactionData['balance_after']) || $transactionData['balance_after'] == 0) {
            // Get the most recent transaction for this vendor to calculate the new balance
            $latestQuery = "SELECT balance_after, type, amount FROM vendor_transactions WHERE vendor_id = ? ORDER BY transaction_date DESC, id DESC LIMIT 1";
            $latestStmt = $this->conn->prepare($latestQuery);
            $latestStmt->bindParam(1, $transactionData['vendor_id']);
            $latestStmt->execute();
            
            $latestBalance = 0;
            if ($latestStmt->rowCount() > 0) {
                $latestRow = $latestStmt->fetch(PDO::FETCH_ASSOC);
                $latestBalance = (float)$latestRow['balance_after']; // Use the actual value, not absolute
                error_log("Previous balance for vendor " . $transactionData['vendor_id'] . ": $latestBalance");
            }
            
            // Calculate new balance based on transaction type
            if ($transactionData['type'] === 'credit') {
                $transactionData['balance_after'] = $latestBalance + $transactionData['amount'];
            } else {
                $transactionData['balance_after'] = $latestBalance - $transactionData['amount'];
            }
            
            error_log("Calculated new balance for vendor " . $transactionData['vendor_id'] . ": " . $transactionData['balance_after']);
        }
        
        // Ensure the balance is never negative (this is a business rule)
        if ($transactionData['balance_after'] < 0) {
            $transactionData['balance_after'] = abs($transactionData['balance_after']);
        }
        
        error_log("Inserting transaction for vendor " . $transactionData['vendor_id'] . " - Type: " . $transactionData['type'] . ", Amount: " . $transactionData['amount'] . ", Balance After: " . $transactionData['balance_after']);
        
        $query = "INSERT INTO vendor_transactions SET 
            vendor_id=:vendor_id,
            expense_id=:expense_id,
            type=:type,
            amount=:amount,
            description=:description,
            transaction_date=:transaction_date,
            balance_after=:balance_after";

        $stmt = $this->conn->prepare($query);

        // Bind values
        $stmt->bindParam(":vendor_id", $transactionData['vendor_id']);
        $stmt->bindParam(":expense_id", $transactionData['expense_id']);
        $stmt->bindParam(":type", $transactionData['type']);
        $stmt->bindParam(":amount", $transactionData['amount']);
        $stmt->bindParam(":description", $transactionData['description']);
        $stmt->bindParam(":transaction_date", $transactionData['transaction_date']);
        $stmt->bindParam(":balance_after", $transactionData['balance_after']);

        $result = $stmt->execute();
        
        if ($result) {
            error_log("Successfully inserted transaction for vendor " . $transactionData['vendor_id']);
        } else {
            error_log("Failed to insert transaction for vendor " . $transactionData['vendor_id']);
        }
        
        return $result;
    }

    // Calculate vendor totals
    public function calculateTotals($vendor_id) {
        // Calculate total credit (expenses)
        $creditQuery = "SELECT SUM(amount) as total_credit FROM expenses WHERE vendor_id = ? AND payment_status = 'credit'";
        $creditStmt = $this->conn->prepare($creditQuery);
        $creditStmt->bindParam(1, $vendor_id);
        $creditStmt->execute();
        $creditResult = $creditStmt->fetch(PDO::FETCH_ASSOC);
        $totalCredit = $creditResult['total_credit'] ? (float)$creditResult['total_credit'] : 0;

        // Calculate total paid (payments)
        $paidQuery = "SELECT SUM(amount) as total_paid FROM vendor_transactions WHERE vendor_id = ? AND type = 'payment'";
        $paidStmt = $this->conn->prepare($paidQuery);
        $paidStmt->bindParam(1, $vendor_id);
        $paidStmt->execute();
        $paidResult = $paidStmt->fetch(PDO::FETCH_ASSOC);
        $totalPaid = $paidResult['total_paid'] ? (float)$paidResult['total_paid'] : 0;

        // Debug logging
        error_log("Vendor ID: $vendor_id");
        error_log("Credit Query: $creditQuery with vendor_id: $vendor_id");
        error_log("Credit Result: " . print_r($creditResult, true));
        error_log("Paid Query: $paidQuery with vendor_id: $vendor_id");
        error_log("Paid Result: " . print_r($paidResult, true));
        error_log("Calculated Totals - Credit: $totalCredit, Paid: $totalPaid");

        return [
            'total_credit' => $totalCredit,
            'total_paid' => $totalPaid
        ];
    }

    // Update vendor totals
    public function updateTotals($vendor_id) {
        $totals = $this->calculateTotals($vendor_id);
        
        error_log("Updating vendor $vendor_id totals - Credit: " . $totals['total_credit'] . ", Paid: " . $totals['total_paid']);
        
        $query = "UPDATE " . $this->table_name . " SET 
            total_credit=:total_credit,
            total_paid=:total_paid
            WHERE id=:id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":total_credit", $totals['total_credit']);
        $stmt->bindParam(":total_paid", $totals['total_paid']);
        $stmt->bindParam(":id", $vendor_id);

        $result = $stmt->execute();
        
        if ($result) {
            error_log("Successfully updated vendor $vendor_id totals");
        } else {
            error_log("Failed to update vendor $vendor_id totals");
            // Log any error info
            $errorInfo = $stmt->errorInfo();
            error_log("Database error: " . print_r($errorInfo, true));
        }
        
        return $result;
    }
}
?>