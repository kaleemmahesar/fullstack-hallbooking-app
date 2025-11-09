<?php
require_once __DIR__ . '/../models/User.php';

class Auth {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function login() {
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->username) || !isset($data->password)) {
            sendError('Username and password are required', 400);
        }

        // Create user instance
        $user = new User($this->conn);
        $user->username = $data->username;
        $user->password = $data->password;

        // Attempt login
        if ($user->login()) {
            // Start session
            if (session_status() == PHP_SESSION_NONE) {
                session_start();
            }
            
            // Set session variables
            $_SESSION['user_id'] = $user->id;
            $_SESSION['username'] = $user->username;

            sendResponse([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username
                ]
            ], 200);
        } else {
            sendError('Invalid username or password', 401);
        }
    }

    public function logout() {
        // Create user instance
        $user = new User($this->conn);
        
        // Logout user
        if ($user->logout()) {
            sendResponse(['message' => 'Logout successful'], 200);
        } else {
            sendError('Logout failed', 500);
        }
    }
}
?>