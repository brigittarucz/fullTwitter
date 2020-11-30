<?php

session_start();

// Comment these lines in production
// $_SESSION['id'] = 12;

// API may fail without image set

// GET user from Arango 

if(!isset($_SESSION['id'])) { sendError(400, 'session user id not set', __LINE__); };

if(!isset($_POST['receiverId'])) { sendError(400, 'receiver id not set', __LINE__); };
if(!isset($_POST['receiverFullname'])) { sendError(400, 'receiver full name not set', __LINE__); };
if(!isset($_POST['receiverUsername'])) { sendError(400, 'receiver username not set', __LINE__); };
if(!isset($_POST['receiverImage'])) { sendError(400, 'receiver image not set', __LINE__); };
if(!isset($_POST['messageBody'])) { sendError(400, 'message not set', __LINE__); };
if(!strlen($_POST['messageBody'])) { sendError(400, 'message body must not be empty', __LINE__); };
if(!(strlen($_POST['messageBody']) < 3500)) { sendError(400, 'message body must be less than 3500 chars', __LINE__); };

// The following line can make or break the API logic
if(!($_POST['receiverId'] != $_SESSION['id'])) { sendError(400, 'receiver and session user id must be different', __LINE__); };

$_POST['receiverId'] = intVal($_POST['receiverId']);

require_once(__DIR__.'/../database/arangodb.php');
use ArangoDBClient\Statement as ArangoStatement;

try {
        
    $statementGetUserSession = new ArangoStatement(
        $dbArango,
        [
            'query' => 'RETURN DOCUMENT(@user)',
            'bindVars' => [
                'user' => "twitterUsersV2/".$_SESSION['id']
            ]
        ]
    );

    $cursorGetUserSession = $statementGetUserSession->execute();
    $oDataUserSession = $cursorGetUserSession->getAll();

    try {

        // TODO: check if conversation exists

        try {
            $statementGetChatId = new ArangoStatement(
                $dbArango,
                [
                    'query' => 'FOR user IN twitterUsersV2 FILTER user._id == @userId RETURN user',
                    'bindVars' => [
                        'userId' => "twitterUsersV2/".$_SESSION['id']
                    ]
                ]
            );

            $cursorGetChatId = $statementGetChatId->execute();
            $dataGetChatId = $cursorGetChatId->getAll();

            $aChats = $dataGetChatId[0]->chatWith;

            $sChatId = 0;

            if (
                sizeof($aChats) != 0
            ) {
                foreach ($aChats as $oChat) {

                    if ($oChat["receiverId"] == $_POST['receiverId']) {
                        $sChatId = $oChat["chatId"];

                        $apiMessagingResponse["chatStatus"] = "both chats already exist";
                        $apiMessagingResponse["wasChatWithEmpty"] = 0;
                        $apiMessagingResponse["updateStatusSender"] = 0;
                        $apiMessagingResponse["updateStatusReceiver"] = 0;
                        break;
                    }
                }
                

                if (!($sChatId)) {
                    $sChatId = 'chat' . uniqid();

                    // TODO: create chat in sender's document 
                    // TODO: create chat in receiver's document

                    $updateStatusSender = updateUser($sChatId, $dbArango, $_SESSION['id'], $_POST['receiverId'], $_POST['receiverFullname'], $_POST['receiverUsername'], $_POST['receiverImage']);

                    $updateStatusReceiver = updateUser($sChatId, $dbArango, $_POST['receiverId'], $_SESSION['id'], $oDataUserSession[0]->fullName, $oDataUserSession[0]->username, $oDataUserSession[0]->profileImage);

                    $apiMessagingResponse["chatStatus"] = "both chats were created";
                    $apiMessagingResponse["wasChatWithEmpty"] = 0;
                    $apiMessagingResponse["updateStatusSender"] = json_decode(stripslashes($updateStatusSender));
                    $apiMessagingResponse["updateStatusReceiver"] = json_decode(stripslashes($updateStatusReceiver));
                }
            } else {

                $sChatId = 'chat' . uniqid();

                // TODO: create chat in sender's document 
                // TODO: create chat in receiver's document

                
                $updateStatusSender = updateUser($sChatId, $dbArango, $_SESSION['id'], $_POST['receiverId'], $_POST['receiverFullname'], $_POST['receiverUsername'], $_POST['receiverImage']);

                $updateStatusReceiver = updateUser($sChatId, $dbArango, $_POST['receiverId'],  $_SESSION['id'],  $oDataUserSession[0]->fullName, $oDataUserSession[0]->username, $oDataUserSession[0]->profileImage);

                $apiMessagingResponse["chatStatus"] = "both chats were created";
                $apiMessagingResponse["wasChatWithEmpty"] = 1;
                $apiMessagingResponse["updateStatusSender"] = json_decode(stripslashes($updateStatusSender));
                $apiMessagingResponse["updateStatusReceiver"] = json_decode(stripslashes($updateStatusReceiver));
            };
        } catch (Exception $ex) {
            sendError(500, 'system under maintainance', $ex);
        }

        // 500 * 1 000 000 users each with 300 bytes/message in document = 150GB

        // TODO: get messages + messages count + add proper chat Id
        $aMessages = getMessages($dbArango);

        // TODO: create message 
        $iChatMessageCount = sizeof($aMessages);
       
        $message = createMessage($sChatId, $iChatMessageCount, $oDataUserSession[0]);

        try {
            $statementInsertMessage = new ArangoStatement(
                $dbArango,
                [
                    'query' => 'INSERT @message INTO twitterChatsV2 RETURN NEW',
                    'bindVars' => [
                        'message' => $message
                    ]
                ]
            );

            $cursorInsertMessage = $statementInsertMessage->execute();
            $oDataMessage = $cursorInsertMessage->getAll();

            $apiMessagingResponse["message"] = [
                "status" => "message with id " . $oDataMessage[0]->getId() . " was created",
                "message" => $oDataMessage[0]->message,
                "created" => $oDataMessage[0]->timestamp
            ];
        } catch (Exception $ex) {
            sendError(500, 'cannot save message', __LINE__);
        }

        // TODO: seed with 499 messages and create deletion of documents

        // TODO: add last message of chat in both users

        $apiMessagingResponse["lastMessageSenderSaved"] = updateLastMessage($dbArango, $_SESSION['id'], $_POST['receiverId']);
        $apiMessagingResponse["lastMessageReceiverSaved"] = updateLastMessage($dbArango, $_POST['receiverId'], $_SESSION['id'], "Receiver");

        // TODO: send to client & refresh

        http_response_code(201);
        header('Content-type: application/json');
        echo json_encode($apiMessagingResponse);
        exit();
    } catch (Exception $ex) {
        sendError(500, 'system under maintainance', $ex);
    }

    var_dump($oDataReceiver);
} catch (Exception $ex) {
    sendError(500, 'system under maintainance', $ex);
}

function createMessage($sChatId, $chatMessageCount, $oDataUserSession) {
    $message["chatId"] = $sChatId;
    $message["chatMessageCount"] = $chatMessageCount;
    $message["receiverId"] = $_POST['receiverId'];
    $message["senderId"] = $_SESSION['id'];
    $message["senderUsername"] = $oDataUserSession->username;
    $message["senderCreated"] = $oDataUserSession->created;
    $date = new DateTime();
    $date = $date->format('Y-m-d H:i:s');
    $message["timestamp"] = $date;
    $message["message"] = $_POST['messageBody'];

    return $message;
}

function getMessages($db) {

    try {
        $statementGetMessages = new ArangoStatement(
            $db,
            [
                'query' => 'FOR message IN twitterChatsV2 FILTER message.receiverId == @receiverId AND message.senderId == @senderId OR message.receiverId == @senderId AND message.senderId == @receiverId RETURN message.message',
                'bindVars' => [
                    'senderId' => $_SESSION['id'],
                    'receiverId' => $_POST['receiverId']
                ]
            ]
        );

        $cursorGetMessages = $statementGetMessages->execute();
        $aMessages = $cursorGetMessages->getAll();

        return $aMessages;
    } catch (Exception $ex) {
        sendError(500, 'cannot get messages', __LINE__);
    }
}

function sendError($iResponseCode, $sMessage, $iLine){
    http_response_code($iResponseCode);
    header('Content-Type: application/json');
    echo '{"message":"'.$sMessage.'", "error":'.$iLine.'}';
    exit();
}

function updateLastMessage($db, $senderId, $receiverId) {

    try {
        $statementGetUserChat = new ArangoStatement(
            $db,
            [
                'query' => 'RETURN DOCUMENT(@user)',
                'bindVars' => [
                    'user' => "twitterUsersV2/".$senderId
                ]
            ]
        );

        $cursorGetUserChat = $statementGetUserChat->execute();
        $oDataGetUserChat = $cursorGetUserChat->getAll();

        $userChats = $oDataGetUserChat[0]->chatWith;

        foreach($userChats as $index=>$chat) {
            if($chat["receiverId"] == $receiverId) {
                $userChats[$index]["lastMessage"] =  substr($_POST['messageBody'],0, 100);
                $date = new DateTime();
                $date = $date->format('Y-m-d H:i:s');
                $userChats[$index]["lastMessageDate"] = $date;

                try {
                    $statementUpdateUserChat = new ArangoStatement(
                        $db,
                        [
                            'query' => 'UPDATE @user WITH {"chatWith": @newChat} IN twitterUsersV2 RETURN NEW',
                            'bindVars' => [
                                'user' => "".$senderId,
                                'newChat' => $userChats
                            ]
                        ]
                    );

                    $cursorStatementUpdateUserChat = $statementUpdateUserChat->execute();
                    $dataUpdateUserChat = $cursorStatementUpdateUserChat->getAll();

                    $aChatWith = $dataUpdateUserChat[0]->chatWith;

                    if($aChatWith[0]) {
                        return 1;
                    } else {
                        return 0;
                    }
                } catch(Exception $ex) {
                    sendError(500, 'cannot update message for user '.$senderId, $ex);
                }

                break;
            }
        }
    } catch (Exception $ex) {
        sendError(500, 'cannot get user', $ex);
    }

}

function updateUser($chatId, $db, $userSender, $userReceiver, $receiverFullname, $receiverUsername, $receiverImage) {
          
    try {
        $statementGetUser = new ArangoStatement(
            $db,
            [
                'query' => 'RETURN DOCUMENT(@senderId)',
                'bindVars' => [
                    'senderId' => "twitterUsersV2/".$userSender // $_SESSION['userId']
                ]
            ]
        );

        $cursorGetUser = $statementGetUser->execute();
        $dataGetUser = $cursorGetUser->getAll();
        
        $sSenderKey = $dataGetUser[0]->getKey();
        $aChats = $dataGetUser[0]->chatWith;

        $newChat["chatId"] = $chatId;
        $newChat["receiverId"] = $userReceiver; // $_POST['receiverId'];
        $newChat["receiverFullName"] = $receiverFullname;
        $newChat["receiverUsername"] = $receiverUsername;
        $newChat["receiverImage"] = $receiverImage;
        $newChat["lastMessage"] = "";
        $newChat["lastMessageDate"] = "";

        array_push($aChats, $newChat);
    } catch (Exception $ex) {
        sendError(500, "user with id $userSender cannot be updated", __LINE__);
    }
    
    // TODO: update only by key

    try {
        $statementUpdateUser = new ArangoStatement(
            $db, 
            [
                'query' => 'UPDATE @senderKey WITH { "chatWith": @chatUpdate } IN twitterUsersV2 RETURN NEW',
                'bindVars' => [
                    'senderKey' => $sSenderKey,
                    'chatUpdate' => $aChats
                ]
            ]
        );

        $cursorUpdateUser = $statementUpdateUser->execute();
        $dataGetUpdate = $cursorUpdateUser->getAll();

        return '{"userChatUpdated":"'.$userSender.'", "chatListSize":'.sizeof($aChats).', "chatWith":"'.$receiverFullname.'"}';
    } catch (Exception $ex) {
        sendError(500, "user with id $userSender cannot be updated", __LINE__);
    }

    // TODO: error handling

}

    