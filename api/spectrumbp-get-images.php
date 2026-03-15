<?php
header('Content-Type: application/json');

// No Docker, se o script está em /api/, o caminho para imagens é:
$dir = __DIR__ . "/../assets/img/spectrumbp/";
$prefix = "spectrumbp-";
$result = [];

if (is_dir($dir)) {
    // glob é mais eficiente para buscar padrões de nomes
    $files = glob($dir . $prefix . "*");
    
    foreach ($files as $file) {
        // basename remove o caminho completo e deixa só o nome do arquivo
        $result[] = basename($file);
    }
} else {
    // Debug: Caso o diretório não seja encontrado
    http_response_code(404);
    echo json_encode(["error" => "Directory not found", "searched_path" => $dir]);
    exit;
}

echo json_encode($result);