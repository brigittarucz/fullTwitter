<?php

session_start();

// TODO: validate session id

if(!isset($_SESSION['id'])) { sendError(400, 'session user id not set', __LINE__); };
if(!isset($_POST['receiverId'])) { sendError(400, 'receiver id not set', __LINE__); };

require_once(__DIR__.'/../database/arangodb.php');
use ArangoDBClient\Statement as ArangoStatement;

try {

    $statementGetReceiver = new ArangoStatement(
        $dbArango,
        [
            'query' => 'RETURN DOCUMENT(@user)',
            'bindVars' => [
                'user' => "twitterUsersV2/".$_POST['receiverId']
            ]
        ]
    );

    $cursorGetReceiver = $statementGetReceiver->execute();
    $oDataReceiver = $cursorGetReceiver->getAll();

    $apiConversationData["receiverId"] = $oDataReceiver[0]->getKey();
    $apiConversationData["receiverImage"] = $oDataReceiver[0]->profileImage;
    $apiConversationData["fullName"] = $oDataReceiver[0]->fullName;
    $apiConversationData["username"] = $oDataReceiver[0]->username;
    $apiConversationData["following"] = $oDataReceiver[0]->following;
    $apiConversationData["followers"] = $oDataReceiver[0]->followers;

    if(isset($_POST['chatId'])) {
        
        try {
            $statementGetChatHistory = new ArangoStatement(
                $db,
                [
                    'query' => 'FOR message IN twitterChatsV2 FILTER message.chatId == @chatId 
                                SORT message.timestamp DESC 
                                LIMIT 15 
                                RETURN { "messageBody": message.message, "receiverId": message.receiverId, 
                                         "messageTimestamp": message.timestamp}',
                    'bindVars' => [
                        'chatId' => $_POST['chatId']
                    ]
                ]
            );

            $cursorGetChatHistory = $statementGetChatHistory->execute();
            $aDataMessages = $cursorGetChatHistory->getAll();

            $apiConversationData["chatHistory"] = $aDataMessages;
            // print_r($aDataMessages[0]);
        } catch (Exception $ex) {
            sendError(500, 'system under maintainance', $ex);
        }

    }

    http_response_code(200);
    header('Content-type: application/json');
    echo json_encode($apiConversationData);
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