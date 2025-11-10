<?php
// Disable error reporting to prevent HTML output interfering with JSON responses
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../models/Vendor.php';

class VendorTransactionAPI {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getByVendorId($vendor_id) {
        // Create vendor instance
        $vendor = new Vendor($this->conn);
        
        // Get transactions by vendor ID
        $stmt = $vendor->getTransactions($vendor_id);
        $num = $stmt->rowCount();

        if ($num > 0) {
            $transactions_arr = array();
            $transactions_arr["data"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $transaction_item = array(
                    'id' => $id,
                    'vendorId' => $vendor_id,
                    'expenseId' => $expense_id,
                    'bookingId' => $booking_id,
                    'type' => $type,
                    'amount' => (float)$amount,
                    'description' => $description,
                    'date' => $transaction_date,
                    'balanceAfter' => (float)$balance_after
                );
                
                $transactions_arr["data"][] = $transaction_item;
            }

            sendResponse($transactions_arr);
        } else {
            sendResponse(["data" => []]);
        }
    }

    public function create() {
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));

        // Validate required fields
        if (!isset($data->vendorId) || !isset($data->type) || !isset($data->amount)) {
            sendError('Vendor ID, type, and amount are required', 400);
        }

        error_log("Creating transaction for vendor " . $data->vendorId . " - Type: " . $data->type . ", Amount: " . $data->amount);

        // Create vendor instance
        $vendor = new Vendor($this->conn);
        
        // Prepare transaction data
        $transactionData = [
            'vendor_id' => $data->vendorId,
            'expense_id' => isset($data->expenseId) ? $data->expenseId : null,
            'type' => $data->type,
            'amount' => $data->amount,
            'description' => $data->description ?? '',
            'transaction_date' => $data->date ?? date('Y-m-d'),
            'balance_after' => isset($data->balanceAfter) ? $data->balanceAfter : 0
        ];

        // Create transaction
        if ($vendor->addTransaction($transactionData)) {
            // Update vendor totals
            error_log("Updating totals for vendor " . $data->vendorId);
            $updateResult = $vendor->updateTotals($data->vendorId);
            
            if ($updateResult) {
                error_log("Successfully updated totals for vendor " . $data->vendorId);
            } else {
                error_log("Failed to update totals for vendor " . $data->vendorId);
            }
            
            sendResponse(['message' => 'Transaction created successfully'], 201);
        } else {
            error_log("Failed to create transaction for vendor " . $data->vendorId);
            sendError('Unable to create transaction', 500);
        }
    }
}
?>