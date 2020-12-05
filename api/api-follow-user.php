<?php

if(!isset($_POST['userFromId'])) { sendError(400, 'user from id not set', __LINE__); };
if(!isset($_POST['userToId'])) { sendError(400, 'user to id not set', __LINE__); };

require_once('../controllers/functions.php');
require_once(__DIR__.'/../database/arangodb.php');
use ArangoDBClient\Statement as ArangoStatement;


// update followers - userIdFrom, userIdTo, created
// update edges - _from, _to which have twitterUsersV2 in front

try {

    $statement = new ArangoStatement(
        $dbArango,
        [
            'query' => 'FOR relation IN twitterFollowersEdgesV2 FILTER relation._from == @userFrom AND relation._to == @userTo RETURN relation',
            'bindVars' => [
                'userFrom' => "twitterUsersV2/".$_POST['userFromId'],
                'userTo' => "twitterUsersV2/".$_POST['userToId']
            ]
        ]
    );

    $cursor = $statement->execute();
    $oRelationExists = $cursor->getAll();

    if(count($oRelationExists)) {
        echo "Relation already exists";
        http_response_code(200);
        die();
    }

    $statement = new ArangoStatement(
        $dbArango,
        [
            'query' => 'FOR user IN twitterUsersV2 FILTER user._key == @userFrom OR user._key == @userTo RETURN user',
            'bindVars' => [
                'userFrom' => $_POST['userFromId'],
                'userTo' => $_POST['userToId']
            ]
        ]
    );

    $cursor = $statement->execute();
    $aDataUsers = $cursor->getAll();

    foreach($aDataUsers as $aUser) {
        if($aUser->getKey() == $_POST['userFromId']) {
            $aUserFrom = $aUser;
        } else {
            $aUserTo = $aUser;
        }
    }

    // update userFromId following
    // update userToId followers

    $statement = new ArangoStatement(
        $dbArango,
        [
            'query' => 'UPDATE @userFrom WITH {"following": @newCount} IN twitterUsersV2',
            'bindVars' => [
                'userFrom' => $_POST['userFromId'],
                'newCount' => $aUserFrom->following + 1
            ]
        ]
    );

    $cursor = $statement->execute();

    $statement = new ArangoStatement(
        $dbArango,
        [
            'query' => 'UPDATE @userTo WITH {"followers": @newCount} IN twitterUsersV2',
            'bindVars' => [
                'userTo' => $_POST['userToId'],
                'newCount' => $aUserTo->followers + 1
            ]
        ]
    );

    $cursor = $statement->execute();

    $statement  = new ArangoStatement(
        $dbArango,
        [
            'query' => 'INSERT { _from: @from, _to: @to } INTO twitterFollowersEdgesV2',
            'bindVars' => [
                'from' =>  'twitterUsersV2/'.$_POST['userFromId'],
                'to' => 'twitterUsersV2/'.$_POST['userToId']
            ]
        ]
    );
    
    $cursor = $statement->execute();

    echo 'Successfully updated graph';
    http_response_code(201);

} catch (Exception $ex) {
    sendError(500, "Following failed".$ex, __LINE__);
}