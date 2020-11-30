<?php

// TODO: validate user search
if(!isset($_POST['userSearch'])) { sendError(400, 'user search is not set', __LINE__); };
if(!(strlen($_POST['userSearch']) >= 3)) { sendError(400, 'user search is less than 3 chars', __LINE__); };

require_once(__DIR__.'/../database/arangodb.php');
use ArangoDBClient\Statement as ArangoStatement;

try {

    $statementSearchUsers = new ArangoStatement(
        $dbArango,
        [
            'query' => 'FOR user IN twitterUsersV2 RETURN {"key": user._key, "fullName": user.fullName, "username": user.username, "profileImage": user.profileImage}'
        ]
    );

    $cursorSearchUsers = $statementSearchUsers->execute();
    $aSearchResultsData = $cursorSearchUsers->getAll();
    $userSearch = $_POST['userSearch'];
    $aUserSearchResults = [];

    foreach($aSearchResultsData as $searchResult) {
        $isSearchMatch = 0;
        // case insensitive
        if(preg_match("#^$userSearch#i", $searchResult->firstName)) {
            $isSearchMatch = 1;
        }
        if(preg_match("#^$userSearch#i", $searchResult->lastName)) {
            $isSearchMatch = 1;
        }
        if(preg_match("#^$userSearch#i", $searchResult->username)) {
            $isSearchMatch = 1;
        }
        if(preg_match("#^$userSearch#i", $searchResult->usernameAt)) {
            $isSearchMatch = 1;
        }
        if($isSearchMatch) {
            array_push($aUserSearchResults, $searchResult);
        }
    }

    http_response_code(200);
    header('Content-type: application/json');
    echo json_encode($aUserSearchResults);
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
