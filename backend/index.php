<?php
// Disable error reporting to prevent HTML output interfering with JSON responses
error_reporting(0);
ini_set('display_errors', 0);

// Enable CORS for frontend communication
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Handle static file requests for uploads
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (strpos($request_uri, '/uploads/') === 0) {
    // Serve the file directly
    $file_path = __DIR__ . $request_uri;
    if (file_exists($file_path) && is_file($file_path)) {
        // Determine content type based on file extension
        $extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
        $content_types = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'pdf' => 'application/pdf'
        ];
        
        $content_type = $content_types[$extension] ?? 'application/octet-stream';
        header('Content-Type: ' . $content_type);
        header('Content-Length: ' . filesize($file_path));
        readfile($file_path);
        exit;
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
        exit;
    }
}

// Include required files
require_once 'config/database.php';
require_once 'utils/helpers.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove the base path to get the relative path
$base_path = '/wedding-hall/backend';
if (strpos($request_uri, $base_path) === 0) {
    $request_uri = substr($request_uri, strlen($base_path));
}

// If that didn't work, try the alternative path
if ($request_uri === $_SERVER['REQUEST_URI']) {
    $base_path = '/hall-booking-app/backend';
    if (strpos($request_uri, $base_path) === 0) {
        $request_uri = substr($request_uri, strlen($base_path));
    }
}

// Remove /index.php if present
if (strpos($request_uri, '/index.php') === 0) {
    $request_uri = substr($request_uri, 10); // Remove '/index.php'
}

// If the URI is empty, set it to root
if ($request_uri === '' || $request_uri === '/') {
    $request_uri = '/api/bookings'; // Default to bookings for testing
}

// Route requests
switch ($request_uri) {
    // Authentication routes
    case '/api/login':
        require_once 'api/auth.php';
        $auth = new Auth($db);
        if ($method == 'POST') {
            $auth->login();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
    
    case '/api/logout':
        require_once 'api/auth.php';
        $auth = new Auth($db);
        if ($method == 'POST') {
            $auth->logout();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    // Booking routes
    case '/api/bookings':
        require_once 'api/bookings.php';
        $booking_api = new BookingAPI($db);
        if ($method == 'GET') {
            $booking_api->getAll();
        } elseif ($method == 'POST') {
            $booking_api->create();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    case (preg_match('/\/api\/bookings\/([0-9]+)/', $request_uri, $matches) ? true : false):
        require_once 'api/bookings.php';
        $booking_api = new BookingAPI($db);
        $id = $matches[1];
        if ($method == 'GET') {
            $booking_api->getById($id);
        } elseif ($method == 'PUT') {
            $booking_api->update($id);
        } elseif ($method == 'DELETE') {
            $booking_api->delete($id);
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    // Expense routes
    case '/api/expenses':
        require_once 'api/expenses.php';
        $expense_api = new ExpenseAPI($db);
        if ($method == 'GET') {
            $expense_api->getAll();
        } elseif ($method == 'POST') {
            $expense_api->create();
        } elseif ($method == 'PUT') {
            $expense_api->update();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    case (preg_match('/\/api\/expenses\/([0-9]+)/', $request_uri, $matches) ? true : false):
        require_once 'api/expenses.php';
        $expense_api = new ExpenseAPI($db);
        $id = $matches[1];
        if ($method == 'DELETE') {
            $expense_api->delete($id);
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    case (preg_match('/\/api\/expenses\/booking\/([0-9]+)/', $request_uri, $matches) ? true : false):
        require_once 'api/expenses.php';
        $expense_api = new ExpenseAPI($db);
        $booking_id = $matches[1];
        if ($method == 'GET') {
            $expense_api->getByBookingId($booking_id);
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    // Vendor routes
    case '/api/vendors':
        require_once 'api/vendors.php';
        $vendor_api = new VendorAPI($db);
        if ($method == 'GET') {
            $vendor_api->getAll();
        } elseif ($method == 'POST') {
            $vendor_api->create();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    case (preg_match('/\/api\/vendors\/([0-9]+)/', $request_uri, $matches) ? true : false):
        require_once 'api/vendors.php';
        $vendor_api = new VendorAPI($db);
        $id = $matches[1];
        if ($method == 'PUT') {
            $vendor_api->update($id);
        } elseif ($method == 'DELETE') {
            $vendor_api->delete($id);
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    // Vendor transaction routes
    case '/api/vendor-transactions':
        require_once 'api/vendor-transactions.php';
        $transaction_api = new VendorTransactionAPI($db);
        if ($method == 'POST') {
            $transaction_api->create();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case (preg_match('/\/api\/vendor-transactions\/([0-9]+)/', $request_uri, $matches) ? true : false):
        require_once 'api/vendor-transactions.php';
        $transaction_api = new VendorTransactionAPI($db);
        $vendor_id = $matches[1];
        if ($method == 'GET') {
            $transaction_api->getByVendorId($vendor_id);
        } elseif ($method == 'POST') {
            $transaction_api->create();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    default:
        sendError('Endpoint not found: ' . $request_uri, 404);
        break;
}
?>