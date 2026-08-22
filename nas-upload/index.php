<?php
// The Scene Studio — NAS upload endpoint
// Deploy this file under the TerraMaster Web Server document root.
// Example: /mnt/md0/public/WEB/_upload/index.php
// Expose it only through the Cloudflare Tunnel; do not publish the NAS port directly.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://thescenestudio.asia');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$expectedToken = getenv('NAS_UPLOAD_TOKEN') ?: '';
$authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = '';
if (preg_match('/^Bearer\s+(.+)$/i', $authorization, $m)) {
    $token = trim($m[1]);
}

if (!$expectedToken || !$token || !hash_equals($expectedToken, $token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$root = '/mnt/md0/public/WEB';
$requestedPath = trim((string)($_POST['path'] ?? ''));

if ($requestedPath === '' || str_contains($requestedPath, "\0")) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'path is required']);
    exit;
}

$requestedPath = str_replace('\\', '/', $requestedPath);
$requestedPath = ltrim($requestedPath, '/');

$parts = array_values(array_filter(explode('/', $requestedPath), fn($part) => $part !== '' && $part !== '.' && $part !== '..'));
if (!$parts || $parts[0] !== 'collections') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Only collections/ paths are allowed']);
    exit;
}

$relativePath = implode('/', $parts);
$destination = $root . '/' . $relativePath;
$directory = dirname($destination);

if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to create destination directory']);
    exit;
}

if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'file is required']);
    exit;
}

$file = $_FILES['file'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Upload failed with PHP error code ' . (int)$file['error']]);
    exit;
}

if (!is_uploaded_file($file['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid uploaded file']);
    exit;
}

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file to NAS storage']);
    exit;
}

@chmod($destination, 0644);

$size = filesize($destination);

echo json_encode([
    'success' => true,
    'path' => '/' . $relativePath,
    'size' => $size === false ? null : $size,
]);
