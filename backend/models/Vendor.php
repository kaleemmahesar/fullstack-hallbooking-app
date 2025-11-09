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
        $this->total_credit = htmlspecialchars(strip_tags($this->total_credit));
        $this->total_paid = htmlspecialchars(strip_tags($this->total_paid));

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":contact_person", $this->contact_person);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":total_credit", $this->total_credit);
        $stmt->bindParam(":total_paid", $this->total_paid);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
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
        $this->total_credit = htmlspecialchars(strip_tags($this->total_credit));
        $this->total_paid = htmlspecialchars(strip_tags($this->total_paid));
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

        return $stmt->execute();
    }

    public function delete() {
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
                $latestBalance = abs((float)$latestRow['balance_after']); // Use absolute value
            }
            
            // Calculate new balance based on transaction type
            if ($transactionData['type'] === 'credit') {
                $transactionData['balance_after'] = $latestBalance + $transactionData['amount'];
            } else {
                $transactionData['balance_after'] = $latestBalance - $transactionData['amount'];
            }
        }
        
        // Ensure the balance is never negative (this is a business rule)
        if ($transactionData['balance_after'] < 0) {
            $transactionData['balance_after'] = abs($transactionData['balance_after']);
        }
        
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

        return $stmt->execute();
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

        return [
            'total_credit' => $totalCredit,
            'total_paid' => $totalPaid
        ];
    }

    // Update vendor totals
    public function updateTotals($vendor_id) {
        $totals = $this->calculateTotals($vendor_id);
        
        $query = "UPDATE " . $this->table_name . " SET 
            total_credit=:total_credit,
            total_paid=:total_paid
            WHERE id=:id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":total_credit", $totals['total_credit']);
        $stmt->bindParam(":total_paid", $totals['total_paid']);
        $stmt->bindParam(":id", $vendor_id);

        return $stmt->execute();
    }
}
?>