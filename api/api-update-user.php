<?php

require_once(__DIR__.'/../controllers/functions.php');
require_once(__DIR__.'/../database/mariadb.php');

require_once(__DIR__.'/../database/arangodb.php');
use ArangoDBClient\Statement as ArangoStatement;

try {

    if(!isset($_POST['userId'])) {
        sendError(400, "User id is not set", __LINE__);
    }

    if(!isset($_POST['userCountry'])) {
        sendError(400, "Country id is not set", __LINE__);
    }

    if(!isset($_POST['userGender'])) {
        sendError(400, "Gender id is not set", __LINE__);
    }

    $query = $dbMaria->prepare('UPDATE users SET user_country_fk = :country_id, user_gender_fk = :gender_id
                                WHERE user_id = :user_id');

    $query->bindValue(":country_id", $_POST['userCountry']);
    $query->bindValue(":gender_id", $_POST['userGender']);
    $query->bindValue(":user_id", $_POST['userId']);

    $query->execute();

    if($_POST['userFile'] != "0") {
        $insertId = $dbMaria->lastInsertId();

        try {

            $statementUpdateImage = new ArangoStatement(
                $dbArango,
                [
                    'query' => 'UPDATE @userId WITH { "profileImage": @profileImage } IN twitterUsersV2 RETURN NEW',
                    'bindVars' => [
                        'userId' => $_POST['userId'],
                        'profileImage' => $_POST['userFile']
                    ]
                ]
            );

            $cursorUpdateImage = $statementUpdateImage->execute();
            $dataUpdate = $cursorUpdateImage->getAll();
            $dataUpdate = $dataUpdate[0];

            echo 'Sucess in updating both user image and data';

        } catch (Exception $ex) {
            sendError(500, "Server error in update user image", __LINE__);
        }
    } else {
        echo 'Success in updating user data';
    }

} catch (Exception $ex) {
    sendError(500, "Server error in update user data", __LINE__);
}