<?php
// Simple test to check if backend is accessible
$url = 'http://localhost/hall-booking-app/backend/index.php';

// Test direct access to index.php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Direct access to index.php:\n";
echo "HTTP Code: " . $http_code . "\n";
echo "Response: " . substr($response, 0, 200) . "...\n";
?>