<?php

session_start();

// TODO: validate session id
if(!isset($_SESSION['id'])) { sendError(400, 'session user id not set', __LINE__); };

require_once(__DIR__.'/../database/arangodb.php');
require_once(__DIR__.'/../controllers/functions.php');

try {

    $user = getUserArango($_SESSION['id'], $dbArango);

    http_response_code(200);
    header('Content-type: application/json');
    echo json_encode($user->chatWith);
    exit();

} catch (Exception $ex) {
    sendError(500, 'system under maintainance', $ex);
}