<?php
// Disable error reporting to prevent HTML output interfering with JSON responses
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../models/Vendor.php';

class VendorAPI {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        // Create vendor instance
        $vendor = new Vendor($this->conn);
        
        // Get all vendors
        $stmt = $vendor->getAll();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $vendors_arr = array();
            $vendors_arr["data"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                // Format vendor data
                $vendor_item = formatVendorResponse($row);
                
                $vendors_arr["data"][] = $vendor_item;
            }

            sendResponse($vendors_arr);
        } else {
            sendResponse(["data" => []]);
        }
    }

    public function create() {
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));

        // Create vendor instance
        $vendor = new Vendor($this->conn);
        
        // Set vendor properties
        $vendor->name = $data->name;
        $vendor->contact_person = $data->contactPerson ?? '';
        $vendor->phone = $data->phone ?? '';
        $vendor->email = $data->email ?? '';
        $vendor->address = $data->address ?? '';
        $vendor->total_credit = $data->totalCredit ?? 0;
        $vendor->total_paid = $data->totalPaid ?? 0;

        // Create vendor
        if ($vendor->create()) {
            // Get the created vendor
            $stmt = $vendor->getById($vendor->id);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format vendor data
            $vendor_item = formatVendorResponse($row);
            
            sendResponse($vendor_item, 201);
        } else {
            sendError('Unable to create vendor', 500);
        }
    }

    public function update($id) {
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));

        // Create vendor instance
        $vendor = new Vendor($this->conn);
        
        // Set vendor properties
        $vendor->id = $id;
        $vendor->name = $data->name;
        $vendor->contact_person = $data->contactPerson ?? '';
        $vendor->phone = $data->phone ?? '';
        $vendor->email = $data->email ?? '';
        $vendor->address = $data->address ?? '';
        $vendor->total_credit = $data->totalCredit ?? 0;
        $vendor->total_paid = $data->totalPaid ?? 0;

        // Update vendor
        if ($vendor->update()) {
            // Get the updated vendor
            $stmt = $vendor->getById($id);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format vendor data
            $vendor_item = formatVendorResponse($row);
            
            sendResponse($vendor_item);
        } else {
            sendError('Unable to update vendor', 500);
        }
    }

    public function delete($id) {
        // Create vendor instance
        $vendor = new Vendor($this->conn);
        
        // Set vendor ID
        $vendor->id = $id;

        // Delete vendor
        if ($vendor->delete()) {
            sendResponse(['message' => 'Vendor deleted successfully']);
        } else {
            sendError('Unable to delete vendor', 500);
        }
    }
}
?>