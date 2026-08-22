<?php
// The Scene Studio — NAS media gateway
// Deploy as /mnt/md0/public/WEB/_upload/index.php
// Public files are stored under /mnt/md0/public/WEB/collections/...

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://thescenestudio.asia');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$tokenFile = '/mnt/md0/.scene-upload-token';
$expectedToken = '';

if (is_readable($tokenFile)) {
    $expectedToken = trim((string)file_get_contents($tokenFile));
}

if ($expectedToken === '') {
    $expectedToken = trim((string)(getenv('NAS_UPLOAD_TOKEN') ?: ''));
}

$authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
$token = '';
if (preg_match('/^Bearer\s+(.+)$/i', $authorization, $m)) {
    $token = trim($m[1]);
}

if ($expectedToken === '' || $token === '' || !hash_equals($expectedToken, $token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$root = '/mnt/md0/public/WEB';

function fail_response(int $status, string $message): never {
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

function safe_relative_path(string $input): string {
    $input = str_replace('\\', '/', trim($input));
    $input = ltrim($input, '/');

    $parts = [];
    foreach (explode('/', $input) as $part) {
        $part = trim($part);
        if ($part === '' || $part === '.' || $part === '..') {
            continue;
        }
        if (!preg_match('/^[a-zA-Z0-9._-]+$/', $part)) {
            fail_response(400, 'Invalid path segment');
        }
        $parts[] = $part;
    }

    return implode('/', $parts);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $requestedPath = safe_relative_path((string)($_POST['path'] ?? ''));

    if ($requestedPath === '' || !str_starts_with($requestedPath, 'collections/')) {
        fail_response(400, 'Only collections/ paths are allowed');
    }

    if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
        fail_response(400, 'file is required');
    }

    $file = $_FILES['file'];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        fail_response(400, 'Upload failed with PHP error code ' . (int)$file['error']);
    }

    if (!is_uploaded_file($file['tmp_name'])) {
        fail_response(400, 'Invalid uploaded file');
    }

    $mime = (string)($file['type'] ?? '');
    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!in_array($mime, $allowed, true)) {
        $detected = function_exists('mime_content_type') ? mime_content_type($file['tmp_name']) : '';
        if (!in_array($detected, $allowed, true)) {
            fail_response(400, 'Unsupported image type');
        }
    }

    $destination = $root . '/' . $requestedPath;
    $directory = dirname($destination);

    if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
        fail_response(500, 'Failed to create destination directory');
    }

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        fail_response(500, 'Failed to move uploaded file to NAS storage');
    }

    @chmod($destination, 0644);

    $size = filesize($destination);
    echo json_encode([
        'success' => true,
        'path' => '/' . $requestedPath,
        'size' => $size === false ? null : $size,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?: '{}', true);
    $requestedPath = safe_relative_path((string)($body['path'] ?? ''));

    if ($requestedPath === '' || !str_starts_with($requestedPath, 'collections/')) {
        fail_response(400, 'Only collections/ paths are allowed');
    }

    $target = $root . '/' . $requestedPath;
    if (!is_file($target)) {
        fail_response(404, 'File not found');
    }

    if (!unlink($target)) {
        fail_response(500, 'Failed to delete file');
    }

    echo json_encode(['success' => true, 'deleted' => '/' . $requestedPath]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
