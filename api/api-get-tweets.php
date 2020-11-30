<?php

require_once(__DIR__.'/../controllers/functions.php');
require_once(__DIR__.'/../database/mariadb.php');

try {
    if(!isset($_GET['id'])) {
        sendError(400, "Id is not set", __LINE__);
    };

    // TODO: get tweets of tweet_user_fk

    $queryTweetsLinksTrue = $dbMaria->prepare('SELECT users.user_id, users.user_username, users.user_full_name, tweets.*, tweetslinks.* 
                                               FROM users JOIN tweets ON tweets.tweet_user_fk=users.user_id 
                                               JOIN tweetslinks ON tweets.tweet_id=tweetslinks.tweet_fk 
                                               ORDER BY tweets.tweet_created DESC 
                                               LIMIT 5');

    // Get own tweets + bindValue(':user_id', $_GET['id']);
    // $queryTweetsLinksFalse = $dbMaria->prepare('SELECT users.user_id, users.user_username, users.user_full_name, tweets.*, tweetslinks.* 
    //                                             FROM users JOIN tweets ON users.user_id = tweets.tweet_user_fk 
    //                                             JOIN tweetslinks ON tweets.tweet_id=tweetslinks.tweet_fk 
    //                                             WHERE user_id=4 
    //                                             ORDER BY tweets.tweet_created 
    //                                             DESC LIMIT 5);
   
    $queryTweetsLinksFalse = $dbMaria->prepare('SELECT users.user_id, users.user_username, users.user_full_name, tweets.* 
                                                FROM users JOIN tweets ON tweets.tweet_user_fk=users.user_id 
                                                WHERE tweets.tweet_has_link = 0 
                                                ORDER BY tweets.tweet_created 
                                                DESC LIMIT 10');

    $queryTweetsLinksFalse->execute();
    $queryTweetsLinksTrue->execute();

    $aTweetsLinksFalse = $queryTweetsLinksFalse->fetchAll();
    $aTweetsLinksTrue = $queryTweetsLinksTrue->fetchAll();

    $aTweets = array_merge($aTweetsLinksFalse, $aTweetsLinksTrue);
    
    function sortByDateCreated($a, $b) {
        return $a->tweet_created - $b->tweet_created;
    }

    usort($aTweets, 'sortByDateCreated');

    echo json_encode($aTweets);

} catch (Exception $err) {
    sendError(500, "Server rror", __LINE__);
}