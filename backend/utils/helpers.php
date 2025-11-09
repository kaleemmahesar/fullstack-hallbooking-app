<?php
// Utility functions for the backend

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    // Don't escape forward slashes in JSON output
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    // Don't escape forward slashes in JSON output
    echo json_encode(['error' => $message], JSON_UNESCAPED_SLASHES);
    exit;
}

function validateRequiredFields($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return false;
        }
    }
    return true;
}

function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(strip_tags(trim($input)));
}

function formatBookingResponse($booking) {
    // Convert booking data to match frontend expectations
    return [
        'id' => $booking['id'],
        'functionDate' => $booking['function_date'],
        'guests' => (int)$booking['guests'],
        'functionType' => $booking['function_type'],
        'bookingBy' => $booking['booking_by'],
        'address' => $booking['address'],
        'cnic' => $booking['cnic'],
        'contactNumber' => $booking['contact_number'],
        'startTime' => $booking['start_time'],
        'endTime' => $booking['end_time'],
        'bookingDays' => (int)$booking['booking_days'],
        'bookingType' => $booking['booking_type'],
        'costPerHead' => (float)$booking['cost_per_head'],
        'fixedRate' => (float)$booking['fixed_rate'],
        'bookingDate' => $booking['booking_date'],
        'totalCost' => (float)$booking['total_cost'],
        'advance' => (float)$booking['advance'],
        'balance' => (float)$booking['balance'],
        'djCharges' => (float)$booking['dj_charges'],
        'decorCharges' => (float)$booking['decor_charges'],
        'tmaCharges' => (float)$booking['tma_charges'],
        'otherCharges' => (float)$booking['other_charges'],
        'specialNotes' => $booking['special_notes'],
        'menuItems' => [], // Will be populated separately
        'payments' => [] // Will be populated separately
    ];
}

function formatExpenseResponse($expense) {
    // Convert expense data to match frontend expectations
    return [
        'id' => $expense['id'],
        'bookingId' => $expense['booking_id'],
        'vendorId' => $expense['vendor_id'], // Vendor ID, will be replaced with vendor name in API
        'title' => $expense['title'],
        'category' => $expense['category'],
        'amount' => (float)$expense['amount'],
        'receiptImage' => $expense['receipt_image'],
        'paymentStatus' => $expense['payment_status'],
        'dueDate' => $expense['due_date'],
        'paymentHistory' => [] // Will be populated separately
    ];
}

function formatVendorResponse($vendor) {
    // Convert vendor data to match frontend expectations
    return [
        'id' => $vendor['id'],
        'name' => $vendor['name'],
        'contactPerson' => $vendor['contact_person'],
        'phone' => $vendor['phone'],
        'email' => $vendor['email'],
        'address' => $vendor['address'],
        'totalCredit' => (float)$vendor['total_credit'],
        'totalPaid' => (float)$vendor['total_paid'],
        'createdAt' => $vendor['created_at']
    ];
}
?>