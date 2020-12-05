<?php

if(!isset($_GET['userId'])) { sendError(400, 'user id not set', __LINE__); };

require_once('../controllers/functions.php');
require_once(__DIR__.'/../database/arangodb.php');

use ArangoDBClient\Statement as ArangoStatement;

try {
    $statement = new ArangoStatement(
        $dbArango,
        [
            'query' => 'FOR user IN twitterUsersV2 FILTER user._key != @userKey SORT RAND() LIMIT 3 RETURN user',
            'bindVars' => [
                'userKey' => $_GET['userId']
            ]
        ]
    );

    $cursor = $statement->execute();
    $oDataRandomUsers = $cursor->getAll();

    echo json_encode($oDataRandomUsers);
} catch (Exception $ex) {
    sendError(500, "Cannot get random users", $ex);
}