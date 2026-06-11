<?php
/**
 * Endpoint alternativo para insertar datos en la base de datos.
 * Usa GET en lugar de POST para mayor compatibilidad con el ESP32.
 *
 * Ejemplo de URL:
 * http://localhost:3000/api-insert.php?id_grupo=10&valor1=65.5&valor2=0
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// ── CONFIGURACION MySQL ──
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "greenhouse";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Conexion fallida: " . $conn->connect_error]);
    exit;
}

// Leer parametros GET
$id_grupo = isset($_GET['id_grupo']) ? intval($_GET['id_grupo']) : 0;
$valor1   = isset($_GET['valor1'])   ? floatval($_GET['valor1'])  : 0.0;
$valor2   = isset($_GET['valor2'])   ? floatval($_GET['valor2'])  : 0.0;

if ($id_grupo === 0) {
    echo json_encode(["error" => "Falta id_grupo", "ejemplo" => "api-insert.php?id_grupo=10&valor1=65.5"]);
    $conn->close();
    exit;
}

// Mapa de IDs a tablas
$map = [
    10 => ["tabla" => "co2_humedad",        "campo" => "humedad"],
    11 => ["tabla" => "co2_temperatura",     "campo" => "temperatura"],
    12 => ["tabla" => "co2_concentracion",   "campo" => "co2_ppm"],
    20 => ["tabla" => "nebulizador_humedad", "campo" => "humedad"],
    30 => ["tabla" => "iluminacion_ppfd",    "campo" => "ppfd"],
    40 => ["tabla" => "riego_temp_suelo",    "campo" => "temperatura_suelo"],
    41 => ["tabla" => "riego_temp_ambiente", "campo" => "temperatura_ambiente"],
    42 => ["tabla" => "riego_hum_ambiente",  "campo" => "humedad_ambiente"],
    43 => ["tabla" => "riego_hum_suelo",     "campo" => "humedad_suelo"],
    44 => ["tabla" => "riego_potasio",       "campo" => "potasio"],
    45 => ["tabla" => "riego_fosforo",       "campo" => "fosforo"],
    46 => ["tabla" => "riego_nitrogeno",     "campo" => "nitrogeno"],
];

if (!isset($map[$id_grupo])) {
    echo json_encode(["error" => "id_grupo invalido", "recibido" => $id_grupo]);
    $conn->close();
    exit;
}

$tabla = $map[$id_grupo]["tabla"];
$campo = $map[$id_grupo]["campo"];
$sql = "INSERT INTO `$tabla` (`$campo`) VALUES ($valor1)";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "id" => $conn->insert_id, "tabla" => $tabla]);
} else {
    echo json_encode(["error" => $conn->error]);
}

$conn->close();
?>
