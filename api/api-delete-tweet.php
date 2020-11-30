<?php

try {

    require_once('../controllers/functions.php');

    if(!isset($_GET['tweetId'])) {
        sendError(400, "Tweet id is not set", __LINE__);
    }

    if(!isset($_GET['userId'])) {
        sendError(400, "User id is not set", __LINE__);
    }

    
    try {

        require(__DIR__.'/../database/mariadb.php'); 

        $query = $dbMaria->prepare('DELETE FROM tweets WHERE tweet_id=:tweet_id');

        $query->bindValue(':tweet_id', $_GET['tweetId']);

        $query->execute();

        if($query->rowCount() == 0) {
            echo 'Fail';
        } else {
            echo 'Success';
        }

    } catch(Exception $ex) {
        sendError(500, "Cannot delete tweet", __LINE__);
    }

} catch (Exception $err) {
    sendError(500, "Server error", __LINE__);
}