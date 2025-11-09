<?php
// Test API endpoints
$base_url = 'http://localhost/hall-booking-app/backend';

// Test get bookings (should work without authentication)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $base_url . '/index.php/api/bookings');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Get Bookings API Test:\n";
echo "HTTP Code: " . $http_code . "\n";
echo "Response: " . $response . "\n\n";

// Test login
$login_data = json_encode([
    'username' => 'admin',
    'password' => 'password'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $base_url . '/index.php/api/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $login_data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login API Test:\n";
echo "HTTP Code: " . $http_code . "\n";
echo "Response: " . $response . "\n";
?>