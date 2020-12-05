<?php

try {

    require_once('../controllers/functions.php');

    if(!isset($_POST['userId'])) {
        sendError(400, "User id is not set", __LINE__);
    }

    if(!isset($_POST['tweetBody'])) {
        sendError(400, "Body is not set", __LINE__);
    }

    if(!(strlen($_POST['tweetBody']) >= 10)) {
        sendError(400, "Body is less than 10 chars", __LINE__);
    }

    if(!(strlen($_POST['tweetBody']) <= 140)) {
        sendError(400, "Body is more than 140 chars", __LINE__);
    }

    $user = getUser($_POST['userId']);

    require(__DIR__.'/../database/mariadb.php');

    try {

        $dbMaria->beginTransaction();

        $queryTweet = $dbMaria->prepare('INSERT INTO tweets VALUES (NULL, :tweet_user_fk, :tweet_body, :tweet_has_link, 0, :tweet_created, 0, 0)');

        $queryTweet->bindValue(":tweet_user_fk", $user->user_id);
        $queryTweet->bindValue(":tweet_body", isset($_POST['urlName']) ? $_POST['tweetBody']." ".$_POST['urlName'] : $_POST['tweetBody']);
        $queryTweet->bindValue(":tweet_has_link", isset($_POST['urlName']) ? 1 : 0);
        $queryTweet->bindValue(":tweet_created", time());

        $queryTweet->execute();

        if ( $queryTweet->rowCount() == 0 ) {
            $dbMaria->rollback();
            sendError(400, 'Transaction went wrong', __LINE__);
        } else {
            $tweetInsertId = $dbMaria->lastInsertId();
            echo $tweetInsertId;
        }

        if(isset($_POST['urlName'])) {

            $queryLink = $dbMaria->prepare('INSERT INTO tweetslinks VALUES (NULL, :tweet_id, :tweetLink_url, :tweetLink_url_image, :tweetLink_url_title, :tweetLink_url_description)');
            
            $queryLink->bindValue(":tweet_id", $tweetInsertId);
            $queryLink->bindValue(":tweetLink_url", $_POST['urlName']);
            $queryLink->bindValue(":tweetLink_url_image", $_POST['urlImage']);
            $queryLink->bindValue(":tweetLink_url_title", $_POST['urlTitle']);
            $queryLink->bindValue(":tweetLink_url_description", $_POST['urlDescription']);

            $queryLink->execute();

            if ( $queryLink->rowCount() == 0 ) {
                $dbMaria->rollback();
                sendError(400, 'Transaction went wrong', __LINE__);
            } else {
                var_dump($queryLink->rowCount());
            }
        }


        $dbMaria->commit();
        // echo "Transaction successful";
        echo 'Success';
        // return $aTweet;
        
    } catch (Exception $err) {
        sendError(500, "Server error update tweet".$err, __LINE__);
    }

} catch (Exception $err) {
    sendError(500, "Server error", __LINE__);
}
