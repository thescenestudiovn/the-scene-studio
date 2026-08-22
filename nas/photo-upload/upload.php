<?php
/**
 * Minimal NAS upload endpoint for TerraMaster Web Server.
 *
 * Deploy to:
 *   /mnt/md0/public/WEB/_upload/upload.php
 *
 * Token file (recommended):
 *   /mnt/md0/public/.scene_upload_token
 */

declare(strict_types=1);

$UPLOAD_ROOT = '/mnt/md0/public/WEB/_upload';
$TOKEN_FILE = '/mnt/md0/public/.scene_upload_token';
$AUTH_TOKEN = '';

if (is_readable($TOKEN_FILE)) {
    $AUTH_TOKEN = trim((string)file_get_contents($TOKEN_FILE));
}
if ($AUTH_TOKEN === '') {
    $AUTH_TOKEN = trim((string)getenv('SCENE_UPLOAD_TOKEN'));
}

function json_response(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, ['error' => 'Method not allowed']);
}

if ($AUTH_TOKEN === '') {
    json_response(500, ['error' => 'Upload token is not configured on NAS']);
}

$authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!hash_equals('Bearer ' . $AUTH_TOKEN, $authorization)) {
    json_response(401, ['error' => 'Unauthorized']);
}

$contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/avif' => 'avif',
];

if (!isset($allowedTypes[$contentType])) {
    json_response(415, ['error' => 'Unsupported image type']);
}

function clean_segment(string $value): string
{
    $parts = preg_split('#[\\/]+#', $value) ?: [];
    $parts = array_filter($parts, static fn($part) => $part !== '' && $part !== '.' && $part !== '..');
    $parts = array_map(static fn($part) => preg_replace('/[^a-zA-Z0-9._-]/', '-', $part), $parts);
    return implode(DIRECTORY_SEPARATOR, $parts);
}

$relativeDir = clean_segment($_GET['path'] ?? 'gallery');
$filename = basename(str_replace('\\', '/', $_GET['filename'] ?? 'file'));
$filename = preg_replace('/[^a-zA-Z0-9._-]/', '-', $filename);
$filename = trim((string)$filename, '.-');

if ($filename === '') {
    json_response(400, ['error' => 'Filename is required']);
}

$extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
if ($extension === '' || !in_array($extension, $allowedTypes, true)) {
    $filename .= '.' . $allowedTypes[$contentType];
}

$root = realpath($UPLOAD_ROOT);
if ($root === false) {
    json_response(500, ['error' => 'Upload root does not exist']);
}

$targetDir = $root . DIRECTORY_SEPARATOR . $relativeDir;
if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true)) {
    json_response(500, ['error' => 'Cannot create upload directory']);
}

$targetDirReal = realpath($targetDir);
if ($targetDirReal === false || ($targetDirReal !== $root && strpos($targetDirReal, $root . DIRECTORY_SEPARATOR) !== 0)) {
    json_response(400, ['error' => 'Invalid upload path']);
}

$target = $targetDirReal . DIRECTORY_SEPARATOR . $filename;
$temp = $target . '.uploading-' . getmypid() . '-' . bin2hex(random_bytes(4));

$input = fopen('php://input', 'rb');
$output = fopen($temp, 'wb');

if ($input === false || $output === false) {
    if (is_resource($input)) fclose($input);
    if (is_resource($output)) fclose($output);
    @unlink($temp);
    json_response(500, ['error' => 'Cannot open upload stream']);
}

try {
    while (!feof($input)) {
        $chunk = fread($input, 1024 * 1024);
        if ($chunk === false) {
            throw new RuntimeException('Read failed');
        }
        if ($chunk !== '' && fwrite($output, $chunk) === false) {
            throw new RuntimeException('Write failed');
        }
    }

    fclose($input);
    fclose($output);

    if (!rename($temp, $target)) {
        throw new RuntimeException('Rename failed');
    }

    $publicPath = '/_upload/' . implode('/', array_filter([$relativeDir, $filename]));

    json_response(201, [
        'ok' => true,
        'path' => $publicPath,
        'filename' => $filename,
    ]);
} catch (Throwable $e) {
    if (is_resource($input)) fclose($input);
    if (is_resource($output)) fclose($output);
    @unlink($temp);
    error_log('Scene NAS upload failed: ' . $e->getMessage());
    json_response(500, ['error' => 'Upload failed']);
}
