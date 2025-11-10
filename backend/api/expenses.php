<?php
// Disable error reporting to prevent HTML output interfering with JSON responses
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../models/Expense.php';
require_once __DIR__ . '/../models/Vendor.php';

class ExpenseAPI {
    private $conn;
    private $uploadDir;

    public function __construct($db) {
        $this->conn = $db;
        // Set upload directory for receipt images
        $this->uploadDir = __DIR__ . '/../uploads/receipts/';
        // Create upload directory if it doesn't exist
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function getAll() {
        // Create expense instance
        $expense = new Expense($this->conn);
        
        // Get all expenses
        $stmt = $expense->getAll();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $expenses_arr = array();
            $expenses_arr["data"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                // Format expense data
                $expense_item = formatExpenseResponse($row);
                
                // Get vendor name
                if ($vendor_id) {
                    $vendor = new Vendor($this->conn);
                    $vendorStmt = $vendor->getById($vendor_id);
                    if ($vendorStmt->rowCount() > 0) {
                        $vendorRow = $vendorStmt->fetch(PDO::FETCH_ASSOC);
                        $expense_item['vendor'] = $vendorRow['name']; // Replace vendorId with vendor name
                    }
                }
                
                // Get payment history
                $expense_item['paymentHistory'] = $expense->getPaymentHistory($id);
                
                $expenses_arr["data"][] = $expense_item;
            }

            sendResponse($expenses_arr);
        } else {
            sendResponse(["data" => []]);
        }
    }

    public function getByBookingId($booking_id) {
        // Create expense instance
        $expense = new Expense($this->conn);
        
        // Get expenses by booking ID
        $stmt = $expense->getByBookingId($booking_id);
        $num = $stmt->rowCount();

        if ($num > 0) {
            $expenses_arr = array();
            $expenses_arr["data"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                // Format expense data
                $expense_item = formatExpenseResponse($row);
                
                // Get vendor name
                if ($vendor_id) {
                    $vendor = new Vendor($this->conn);
                    $vendorStmt = $vendor->getById($vendor_id);
                    if ($vendorStmt->rowCount() > 0) {
                        $vendorRow = $vendorStmt->fetch(PDO::FETCH_ASSOC);
                        $expense_item['vendor'] = $vendorRow['name']; // Replace vendorId with vendor name
                    }
                }
                
                // Get payment history
                $expense_item['paymentHistory'] = $expense->getPaymentHistory($id);
                
                $expenses_arr["data"][] = $expense_item;
            }

            sendResponse($expenses_arr);
        } else {
            sendResponse(["data" => []]);
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
        if (!isset($data->title) || !isset($data->category) || !isset($data->amount)) {
            sendError('Title, category, and amount are required', 400);
            return;
        }

        // Create expense instance
        $expense = new Expense($this->conn);
        
        // Set expense properties
        $expense->booking_id = $data->bookingId ?? null;
        // Handle both vendor and vendorId field names
        $expense->vendor_id = $data->vendorId ?? $data->vendor ?? null;
        $expense->title = $data->title;
        $expense->category = $data->category;
        $expense->amount = $data->amount;
        
        // Handle receipt image upload
        $receiptImagePath = '';
        if (isset($data->receiptImage) && !empty($data->receiptImage)) {
            // Check if it's a base64 string
            if (strpos($data->receiptImage, 'data:image') === 0) {
                // Handle base64 image upload
                $receiptImagePath = $this->saveBase64Image($data->receiptImage);
            } else {
                // Assume it's already a file path
                $receiptImagePath = $data->receiptImage;
            }
        }
        $expense->receipt_image = $receiptImagePath;
        
        $expense->payment_status = $data->paymentStatus ?? 'paid';
        $expense->due_date = $data->dueDate ?? null;

        // Create expense
        if ($expense->create()) {
            // Add payment history if provided
            if (isset($data->paymentHistory) && is_array($data->paymentHistory)) {
                $expense->addPaymentHistory($expense->id, $data->paymentHistory);
            }
            
            // If this is a credit expense for a vendor, create a vendor transaction
            if ($expense->payment_status === 'credit' && $expense->vendor_id) {
                error_log("Creating vendor transaction for expense " . $expense->id . " and vendor " . $expense->vendor_id);
                
                $vendor = new Vendor($this->conn);
                // Get the most recent transaction for this vendor to calculate the new balance
                $latestQuery = "SELECT balance_after FROM vendor_transactions WHERE vendor_id = ? ORDER BY transaction_date DESC, id DESC LIMIT 1";
                $latestStmt = $this->conn->prepare($latestQuery);
                $latestStmt->bindParam(1, $expense->vendor_id);
                $latestStmt->execute();
                
                $latestBalance = 0;
                if ($latestStmt->rowCount() > 0) {
                    $latestRow = $latestStmt->fetch(PDO::FETCH_ASSOC);
                    $latestBalance = (float)$latestRow['balance_after']; // Use the actual value, not absolute
                    error_log("Previous balance for vendor " . $expense->vendor_id . ": $latestBalance");
                }
                
                // Calculate new balance (adding credit increases balance)
                $newBalance = $latestBalance + $expense->amount;
                error_log("New balance for vendor " . $expense->vendor_id . ": $newBalance");
                
                $transactionData = [
                    'vendor_id' => $expense->vendor_id,
                    'expense_id' => $expense->id,
                    'type' => 'credit',
                    'amount' => $expense->amount,
                    'description' => 'Expense: ' . $expense->title,
                    'transaction_date' => date('Y-m-d'),
                    'balance_after' => $newBalance
                ];
                
                error_log("Transaction data: " . print_r($transactionData, true));
                
                if ($vendor->addTransaction($transactionData)) {
                    error_log("Successfully created vendor transaction, updating totals");
                    $vendor->updateTotals($expense->vendor_id);
                } else {
                    error_log("Failed to create vendor transaction");
                }
            }
            
            // Get the created expense
            $stmt = $expense->getById($expense->id);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format expense data
            $expense_item = formatExpenseResponse($row);
            
            // Get vendor name
            if ($row['vendor_id']) {
                $vendor = new Vendor($this->conn);
                $vendorStmt = $vendor->getById($row['vendor_id']);
                if ($vendorStmt->rowCount() > 0) {
                    $vendorRow = $vendorStmt->fetch(PDO::FETCH_ASSOC);
                    $expense_item['vendor'] = $vendorRow['name']; // Replace vendorId with vendor name
                }
            }
            
            // Get payment history
            $expense_item['paymentHistory'] = $expense->getPaymentHistory($expense->id);
            
            sendResponse($expense_item, 201);
        } else {
            sendError('Unable to create expense', 500);
        }
    }

    public function update() {
        // Get posted data
        $json = file_get_contents("php://input");
        $data = json_decode($json);

        // Validate required fields
        if (!isset($data->id)) {
            sendError('Expense ID is required', 400);
        }

        // Create expense instance
        $expense = new Expense($this->conn);
        
        // Set expense properties
        $expense->id = $data->id;
        $expense->booking_id = $data->bookingId ?? null;
        // Handle both vendor and vendorId field names
        $expense->vendor_id = $data->vendorId ?? $data->vendor ?? null;
        $expense->title = $data->title;
        $expense->category = $data->category;
        $expense->amount = $data->amount;
        
        // Handle receipt image upload
        $receiptImagePath = '';
        if (isset($data->receiptImage) && !empty($data->receiptImage)) {
            // Check if it's a base64 string
            if (strpos($data->receiptImage, 'data:image') === 0) {
                // Handle base64 image upload
                $receiptImagePath = $this->saveBase64Image($data->receiptImage);
            } else {
                // Assume it's already a file path
                $receiptImagePath = $data->receiptImage;
            }
        }
        $expense->receipt_image = $receiptImagePath;
        
        $expense->payment_status = $data->paymentStatus ?? 'paid';
        $expense->due_date = $data->dueDate ?? null;

        // Update expense
        if ($expense->update()) {
            // Add payment history if provided
            if (isset($data->paymentHistory) && is_array($data->paymentHistory)) {
                $expense->addPaymentHistory($expense->id, $data->paymentHistory);
            }
            
            // Get the updated expense
            $stmt = $expense->getById($expense->id);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format expense data
            $expense_item = formatExpenseResponse($row);
            
            // Get vendor name
            if ($row['vendor_id']) {
                $vendor = new Vendor($this->conn);
                $vendorStmt = $vendor->getById($row['vendor_id']);
                if ($vendorStmt->rowCount() > 0) {
                    $vendorRow = $vendorStmt->fetch(PDO::FETCH_ASSOC);
                    $expense_item['vendor'] = $vendorRow['name']; // Replace vendorId with vendor name
                }
            }
            
            // Get payment history
            $expense_item['paymentHistory'] = $expense->getPaymentHistory($expense->id);
            
            sendResponse($expense_item);
        } else {
            sendError('Unable to update expense', 500);
        }
    }

    public function delete($id) {
        // Create expense instance
        $expense = new Expense($this->conn);
        
        // Set expense ID
        $expense->id = $id;

        // Get expense before deleting to handle vendor transactions
        $stmt = $expense->getById($id);
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // If this expense had a vendor, update vendor totals
            if ($row['vendor_id']) {
                $vendor = new Vendor($this->conn);
                $vendor->updateTotals($row['vendor_id']);
            }
        }

        // Delete expense
        if ($expense->delete()) {
            sendResponse(['message' => 'Expense deleted successfully']);
        } else {
            sendError('Unable to delete expense', 500);
        }
    }

    // Helper method to save base64 image to file
    private function saveBase64Image($base64Image) {
        // Remove data URL prefix if present
        if (strpos($base64Image, 'data:image') === 0) {
            $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
        }
        
        // Decode base64 image
        $imageData = base64_decode($base64Image);
        
        if ($imageData === false) {
            return ''; // Return empty string if decoding fails
        }
        
        // Generate unique filename
        $filename = uniqid() . '.jpg'; // Default to jpg, can be improved
        $filepath = $this->uploadDir . $filename;
        
        // Save image to file
        if (file_put_contents($filepath, $imageData)) {
            // Return relative path for web access
            return '/uploads/receipts/' . $filename;
        }
        
        return ''; // Return empty string if saving fails
    }

}
?>