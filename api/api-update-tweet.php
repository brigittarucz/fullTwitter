<?php

try {

    require_once('../controllers/functions.php');

    if(!isset($_POST['tweetId'])) {
        sendError(400, "Tweet id is not set", __LINE__);
    }

    if(!isset($_POST['userId'])) {
        sendError(400, "User id is not set", __LINE__);
    }

    $aTweet = getTweet($_POST['userId'], $_POST['tweetId']);
    $aTweet = $aTweet[0];

    if(isset($_POST['tweetBody'])) {
        if($_POST['tweetBody'] == $aTweet->tweet_body) {
            sendError(400, "No change in tweet body", __LINE__);
        }
        if(!(strlen($_POST['tweetBody']) >= 10)) {
            sendError(400, "Body is less than 10 chars", __LINE__);
        }
    
        if(!(strlen($_POST['tweetBody']) <= 140)) {
            sendError(400, "Body is more than 140 chars", __LINE__);
        }
        $aTweet->tweet_body = $_POST['tweetBody'];
    }

    if(isset($_POST['hidden'])) {
        $aTweet->tweet_partial_display = $_POST['hidden']+0;
    }
    
    if(isset($_POST['urlName'])) {
        if($_POST['urlName'] != 'no-reset') {
            $aTweet->tweet_has_link = 1;
            $aTweet->tweetLink_url = $_POST['urlName'];
            $aTweet->tweetLink_url_image = $_POST['urlImage'] == "null" ? "false" : $_POST['urlImage'];
            $aTweet->tweetLink_url_title = $_POST['urlTitle'];
            $aTweet->tweetLink_url_description = $_POST['urlDescription'];
            var_dump($aTweet);
        } else if(!isset($_POST['urlName']) && ($aTweet->tweet_has_link == '1')) {
            $aTweet->tweet_has_link = 0;
            var_dump($aTweet);
        }
    }
    // TODO: check if tweet body is the same

    require(__DIR__.'/../database/mariadb.php');

    if(!isset($_POST['hidden'])) {
        try {
            
            $dbMaria->beginTransaction();

            // CAN MODIFY OWN TWEETS
            // $query = $dbMaria->prepare('UPDATE tweets SET tweet_body = :tweet_body, tweet_has_link = :tweet_has_link WHERE tweets.tweet_user_fk=:user_id AND tweets.tweet_id=:tweet_id');
            // CAN MODIFY ANY TWEETS
            $query = $dbMaria->prepare('UPDATE tweets SET tweet_body = :tweet_body, tweet_has_link = :tweet_has_link, tweet_partial_display = :tweet_partial_display WHERE tweets.tweet_id=:tweet_id');

            $query->bindValue(":tweet_body", $aTweet->tweet_body);
            $query->bindValue(":tweet_has_link", $aTweet->tweet_has_link);
            $query->bindValue(":tweet_partial_display", $aTweet->tweet_partial_display);
            // $query->bindValue(":user_id", $aTweet->tweet_user_fk);
            $query->bindValue(":tweet_id", $aTweet->tweet_id);

            $query->execute();

            // Trigger in place for update with a link set to 0

            if ( $query->rowCount() == 0 ) {
                $dbMaria->rollback();
                sendError(400, 'Transaction went wrong', __LINE__);
            } else {
                var_dump($query->rowCount());
            }

            if(isset($_POST['urlName'])) {    

                $query = $dbMaria->prepare('INSERT INTO tweetslinks VALUES (NULL, :tweet_id, :tweetLink_url, :tweetLink_url_image, :tweetLink_url_title, :tweetLink_url_description)');
                // $query = $dbMaria->prepare('UPDATE tweetslinks SET tweetLink_url = :tweetLink_url, tweetLink_url_image = :tweetLink_url_image, 
                // tweetLink_url_title = :tweetLink_url_title, tweetLink_url_description = :tweetLink_url_description WHERE tweet_fk = :tweet_id');
                
                $query->bindValue(":tweet_id", $aTweet->tweet_id);
                $query->bindValue(":tweetLink_url", $aTweet->tweetLink_url);
                $query->bindValue(":tweetLink_url_image", $aTweet->tweetLink_url_image);
                $query->bindValue(":tweetLink_url_title", $aTweet->tweetLink_url_title);
                $query->bindValue(":tweetLink_url_description", $aTweet->tweetLink_url_description);

                $query->execute();
        
                // both rows return good values but they do not update

                if ( $query->rowCount() == 0 ) {
                    $dbMaria->rollback();
                    sendError(400, 'Transaction went wrong', __LINE__);
                } else {
                    var_dump($query->rowCount());
                }
            }


            $dbMaria->commit();
            // echo "Transaction successful";
            echo 'Success';
            // return $aTweet;
            
        } catch (Exception $err) {
            sendError(500, "Server error update tweet".$err, __LINE__);
        }
    } else {

        try {
            $query = $dbMaria->prepare('UPDATE tweets SET tweet_partial_display = :tweet_partial_display WHERE tweets.tweet_id=:tweet_id');

            $query->bindValue(":tweet_partial_display", $aTweet->tweet_partial_display);
            $query->bindValue(":tweet_id", $aTweet->tweet_id);

            $query->execute();


            if ( $query->rowCount() == 0 ) {
                sendError(400, 'Could not set partial display', __LINE__);
            } else {
                echo 'Success';
            }
        } catch (Exception $err) {
            sendError(500, "Server error update partial display".$err, __LINE__);
        }

    }

} catch (Exception $err) {
    sendError(500, "Server error", __LINE__);
}