<?php
/**
 * Greenhouse Server - Endpoint para recibir datos del ESP32 (Datalogger)
 *
 * Este archivo recibe los datos enviados por el datalogger via HTTP POST
 * y los inserta en las tablas correspondientes de MySQL.
 *
 * Formato esperado del POST (application/x-www-form-urlencoded):
 *   id_grupo=10&valor1=65.5&valor2=0
 *
 * El campo id_grupo determina a que tabla van los datos.
 * Configura los mismos IDs en tu Datalogger_ahorasi.ino
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responder a preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── CONFIGURACION DE LA BASE DE DATOS ──
$servername = "localhost";
$username   = "root";
$password   = "";          // Cambia si tu root tiene contraseña
$dbname     = "greenhouse";
$port       = 3306;

// ── CONECTAR A MySQL ──
$conn = new mysqli($servername, $username, $password, $dbname, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Conexion fallida: " . $conn->connect_error]);
    exit;
}
$conn->set_charset("utf8mb4");

// ── SOLO ACEPTAR POST ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Solo se acepta POST"]);
    $conn->close();
    exit;
}

// ── LEER PARAMETROS DEL POST ──
// Soporta tanto form-data como x-www-form-urlencoded
$id_grupo = isset($_POST['id_grupo']) ? intval($_POST['id_grupo']) : 0;
$valor1   = isset($_POST['valor1'])   ? floatval($_POST['valor1'])  : 0.0;
$valor2   = isset($_POST['valor2'])   ? floatval($_POST['valor2'])  : 0.0;

// Si no llegan por $_POST, intentar leer del input raw (para algunos clientes)
if ($id_grupo === 0) {
    $input = file_get_contents('php://input');
    parse_str($input, $data);
    $id_grupo = isset($data['id_grupo']) ? intval($data['id_grupo']) : 0;
    $valor1   = isset($data['valor1'])   ? floatval($data['valor1'])  : 0.0;
    $valor2   = isset($data['valor2'])   ? floatval($data['valor2'])  : 0.0;
}

// ── VALIDAR id_grupo ──
if ($id_grupo === 0) {
    http_response_code(400);
    echo json_encode(["error" => "Falta id_grupo", "received" => $_POST]);
    $conn->close();
    exit;
}

// ── MAPA DE ID_GRUPO -> TABLA Y COLUMNA ──
// Aqui defines que sensor va a que tabla
// Modifica estos IDs segun tu configuracion en el datalogger
$sensorMap = [
    // === PROYECTO CO2 ===
    10 => ["tabla" => "co2_humedad",        "campo" => "humedad",        "tipo" => "single"],
    11 => ["tabla" => "co2_temperatura",     "campo" => "temperatura",     "tipo" => "single"],
    12 => ["tabla" => "co2_concentracion",   "campo" => "co2_ppm",         "tipo" => "single"],

    // === PROYECTO NEBULIZADOR ===
    20 => ["tabla" => "nebulizador_humedad", "campo" => "humedad",        "tipo" => "single"],

    // === PROYECTO ILUMINACION ===
    30 => ["tabla" => "iluminacion_ppfd",    "campo" => "ppfd",           "tipo" => "single"],
    31 => ["tabla" => "iluminacion_dli",     "campo" => null,             "tipo" => "dli"],
    32 => ["tabla" => "iluminacion_espectro","campo" => null,             "tipo" => "espectro"],

    // === PROYECTO SISTEMA DE RIEGO ===
    40 => ["tabla" => "riego_temp_suelo",    "campo" => "temperatura_suelo",    "tipo" => "single"],
    41 => ["tabla" => "riego_temp_ambiente", "campo" => "temperatura_ambiente", "tipo" => "single"],
    42 => ["tabla" => "riego_hum_ambiente",  "campo" => "humedad_ambiente",      "tipo" => "single"],
    43 => ["tabla" => "riego_hum_suelo",     "campo" => "humedad_suelo",         "tipo" => "single"],
    44 => ["tabla" => "riego_potasio",       "campo" => "potasio",                "tipo" => "single"],
    45 => ["tabla" => "riego_fosforo",       "campo" => "fosforo",                "tipo" => "single"],
    46 => ["tabla" => "riego_nitrogeno",     "campo" => "nitrogeno",              "tipo" => "single"],
];

// ── VERIFICAR SI EL ID EXISTE ──
if (!isset($sensorMap[$id_grupo])) {
    http_response_code(400);
    echo json_encode([
        "error" => "id_grupo no reconocido",
        "id_grupo_recibido" => $id_grupo,
        "ids_validos" => array_keys($sensorMap)
    ]);
    $conn->close();
    exit;
}

// ─- CONSTRUIR Y EJECUTAR LA CONSULTA ──
$cfg = $sensorMap[$id_grupo];
$tabla = $cfg["tabla"];
$sql = "";

if ($cfg["tipo"] === "single") {
    // Sensor simple: un valor
    $campo = $cfg["campo"];
    $sql = "INSERT INTO `$tabla` (`$campo`) VALUES ($valor1)";

} elseif ($cfg["tipo"] === "dli") {
    // DLI: calcula porcentaje y excedente automaticamente
    $dliObjetivo = 25.0;
    $porcentaje = min(($valor1 / $dliObjetivo) * 100, 100);
    $excedente = max(0, $valor1 - $dliObjetivo);
    $dliTotal = $valor1 + 2.5;
    $sql = "INSERT INTO `iluminacion_dli`
            (`dli_acumulado`, `dli_total`, `dli_objetivo`, `porcentaje`, `excedente`)
            VALUES ($valor1, $dliTotal, $dliObjetivo, $porcentaje, $excedente)";

} elseif ($cfg["tipo"] === "espectro") {
    // Espectro: 8 canales
    // valor1 = canal dominante (0-7), valor2 = intensidad total
    $canalDominanteIdx = min(7, max(0, intval($valor1)));
    $intensidad = $valor2 > 0 ? $valor2 : 1000;

    // Distribuir intensidad entre 8 canales (simulando espectro)
    $nombresCanales = ["Violeta", "Indigo", "Azul", "Cian", "Verde", "Amarillo", "Naranja", "Rojo"];
    $ch = [];
    for ($i = 0; $i < 8; $i++) {
        if ($i === $canalDominanteIdx) {
            $ch[$i] = $intensidad * 0.6;  // Canal dominante = 60%
        } else {
            $ch[$i] = $intensidad * 0.05; // Otros canales = 5% cada uno
        }
    }

    $sql = "INSERT INTO `iluminacion_espectro`
            (`ch0`, `ch1`, `ch2`, `ch3`, `ch4`, `ch5`, `ch6`, `ch7`, `canal_dominante`, `foco_estado`)
            VALUES ({$ch[0]}, {$ch[1]}, {$ch[2]}, {$ch[3]}, {$ch[4]}, {$ch[5]}, {$ch[6]}, {$ch[7]}, '{$nombresCanales[$canalDominanteIdx]}', 'ON')";
}

// ── EJECUTAR INSERT ──
if ($conn->query($sql) === TRUE) {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "id" => $conn->insert_id,
        "tabla" => $tabla,
        "id_grupo" => $id_grupo,
        "valor1" => $valor1,
        "valor2" => $valor2,
        "sql" => $sql  // Quitar en produccion
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "error" => $conn->error,
        "sql" => $sql
    ]);
}

$conn->close();
?>
