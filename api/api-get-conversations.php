<?php

session_start();

// TODO: validate session id
if(!isset($_SESSION['id'])) { sendError(400, 'session user id not set', __LINE__); };

require_once(__DIR__.'/../database/arangodb.php');
use ArangoDBClient\Statement as ArangoStatement;

try {

    $statementGetUserConversations = new ArangoStatement(
        $dbArango, 
        [
            'query' => 'RETURN DOCUMENT(@userId)',
            'bindVars' => [
                'userId' => "twitterUsersV2/".$_SESSION["id"]
            ]
        ]
    );

    $cursorStatementGetUserConversations = $statementGetUserConversations->execute();
    $dataUserConversations = $cursorStatementGetUserConversations->getAll();

    http_response_code(200);
    header('Content-type: application/json');
    echo json_encode($dataUserConversations[0]->chatWith);
    exit();

} catch (Exception $ex) {
    sendError(500, 'system under maintainance', $ex);
}


function sendError($iResponseCode, $sMessage, $iLine){
    http_response_code($iResponseCode);
    header('Content-Type: application/json');
    echo '{"message":"'.$sMessage.'", "error":'.$iLine.'}';
    exit();
}