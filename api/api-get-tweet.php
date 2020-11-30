<?php

try{

    require_once('../controllers/functions.php');

    if(!isset($_GET['userId'])) {
        sendError(400, "User id is not set", __LINE__);
    }

    if(!isset($_GET['tweetId'])) {
        sendError(400, "Tweet id is not set", __LINE__);
    }

    $oTweet = getTweet($_GET['userId'], $_GET['tweetId']);

    echo json_encode($oTweet);

} catch(Exception $err) {
    sendError(500, "Server error", __LINE__);
}