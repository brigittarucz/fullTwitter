<?php


require_once('../controllers/functions.php');
if(!isset($_GET['userId'])) { sendError(400, 'user id not set', __LINE__); };
require_once(__DIR__.'/../database/arangodb.php');

use ArangoDBClient\Statement as ArangoStatement;

try {
    $statement = new ArangoStatement(
        $dbArango,
        [
            'query' => 'FOR vertex IN 1..2 OUTBOUND @userId
                        GRAPH "twitterFollowersGraph" 
                        FILTER vertex._key != @userKey RETURN DISTINCT vertex',
            'bindVars' => [
                'userId' => 'twitterUsersV2/'.$_GET['userId'],
                'userKey' => $_GET['userId']
            ]
        ]
    );

    $cursor = $statement->execute();
    $oDataRecommendedUsers = $cursor->getAll();

    echo json_encode($oDataRecommendedUsers);
} catch (Exception $ex) {
    sendError(500, "Cannot get recommended users", $ex);
}

