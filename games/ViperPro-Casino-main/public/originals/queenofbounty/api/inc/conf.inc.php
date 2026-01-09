<?php
$res = new stdClass();

$db_host = getenv('DB_HOST') ?: "localhost";
$db_user = getenv('DB_USERNAME') ?: "root";
$db_pass = getenv('DB_PASSWORD') ?: "";
$db_name = getenv('DB_DATABASE') ?: "ggds_casinoprovider";

$con = new mysqli($db_host, $db_user, $db_pass, $db_name);

$multiples = [
    0 => [1, 2, 3, 5],
    1 => [1, 2, 3, 5],
    2 => [3, 6, 9, 20],
    3 => [6, 12, 18, 40]
];
$_SESSION['multiples'] = $multiples[0];