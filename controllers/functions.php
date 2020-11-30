<?php


use ArangoDBClient\Statement as ArangoStatement;


function callDb() {
    // If we have an associative array + second arg true = $aUser['email']
    
    require(__DIR__.'/../database/mariadb.php');

    try {
        $q = $dbMaria->prepare('CALL `getUsers`()');
        $q->execute();

        $aUsers = $q->fetchAll();       
        return $aUsers;
        
    } catch (Exception $err) {
        sendError(500, "Cannot get users", __LINE__);
    }
}

function getUser($id) {

    $aUsers = callDb();

    foreach($aUsers as $aUser) {
        if($aUser->user_id == $id) {
            return $aUser;
        }
    }

    echo '{"error": "User does not exist"}';
}

function postUser($email, $password) {

    $aUsers = callDb();

    // TODO: validate password
    foreach($aUsers as $aUser) {

        
        if($aUser->{'user_email'} == $email) {
            if(password_verify($password, $aUser->{'user_password'})) {
                var_dump($aUser->{'user_email'});
                //    $aUserToSend;
               $aUserToSend["id"] = $aUser->{'user_id'};
               $aUserToSend["name"] = $aUser->{'user_name'};

               return json_encode($aUserToSend);
            } else {
               return 0;
           }
       }
    }

}

function getEmail($email) {

    $aUsers = callDb();

    // TODO: send back changed password
    require(__DIR__.'/../database/mariadb.php');

    foreach($aUsers as $aUser) {

        if($aUser->user_email == $email) {
            try {
                $hash = password_hash(uniqid(), PASSWORD_DEFAULT);

                $query = $dbMaria->prepare('UPDATE users SET user_password=:password WHERE user_id=:id');
    
                $query->bindValue('password', $hash);
                $query->bindValue('id', $aUser->user_id);
    
                $query->execute();
                // file_put_contents('database/users.txt', json_encode($aUsers));
                // echo $query->rowCount() != 0 ? json_encode($hash.'&id='.$aUser->user_id) : 500;
                return $query->rowCount() != 0 ? json_encode($hash.'&id='.$aUser->user_id) : 400;
            } catch (Exception $ex) {
                return 500;
            }
        } 
    }

    return 404;
}

function updatePassword($oldPassword, $newPassword, $userId) {

    $aUsers = callDb();

    require(__DIR__.'/../database/mariadb.php');

    foreach($aUsers as $aUser) {
        if($aUser->user_id == $userId) {

            if($aUser->user_password == $oldPassword) {
                try {
                $query = $dbMaria->prepare('UPDATE users SET user_password=:password WHERE user_id=:id');

                $query->bindValue('password', password_hash($newPassword, PASSWORD_DEFAULT));
                $query->bindValue('id', $userId);

                $query->execute();
                return $query->rowCount() != 0 ? 200 : 400;     
                } catch (Exception $ex) {
                    return 500;
                }
            }
        }
    }

    return 404;

}

function createUser($email, $password, $name, $birthdate) {

        $aUsers = callDb();

        // TODO: check for email duplicate
        foreach($aUsers as $aUser) {
            if($aUser->user_email == $email) {
                return 0;
            }
        }

        require(__DIR__.'/../database/mariadb.php'); 

        try {
        $query = $dbMaria->prepare('INSERT INTO users VALUES 
        (NULL, :user_email, :user_password, :user_username, :user_full_name, NOW(), :user_birthdate, 1, 1, "generic.png", "media/", 0, :user_verification_code, 0, :user_ip_created)');

        $username = strtolower(preg_replace('/\s*/', '', $name)).rand(100,10000);

        $query->bindValue(':user_email', $email);
        $query->bindValue(':user_password', password_hash($password, PASSWORD_DEFAULT));
        $query->bindValue(':user_username',  $username);
        $query->bindValue(':user_full_name', $name);
        $query->bindValue(':user_birthdate', $birthdate);
        $query->bindValue(':user_verification_code', rand(100000, 1000000));
        $clientIp = get_client_ip() === '::1' ? '127.0.0.1' : get_client_ip();
        $query->bindValue(':user_ip_created', $clientIp);

        $query->execute();

        try {

            require(__DIR__.'/../database/arangodb.php');

            $user = setUser($dbMaria->lastInsertId(), $name, $username);

            $statement = new ArangoStatement(
                $dbArango,
                [
                    'query' => "INSERT @user INTO twitterUsersV2 RETURN NEW",
                    'bindVars' => [
                        'user' => $user
                    ]
                ]
            );

            $cursor = $statement->execute();

        } catch (Exception $err) {
            sendError(500, "Cannot insert in ArangoDB", __LINE__);
        }

    } catch (Exception $ex) {
        sendError(500, 'Server error', __LINE__);
    }

    return json_encode(getUser($dbMaria->lastInsertId()));
}

function setUser($id, $fullName, $username) {
    $user['_key'] = $id;
    $user['fullName'] = $fullName;
    $user['username'] = $username;
    $date = new DateTime();
    $date = $date->format('Y-m-d H:i:s');
    $user['created'] = $date;
    $user['profileImage'] = "";
    $user['following'] = 0;
    $user['followers'] = 0;
    $user['chatWith'] = [];
   
    return $user;
}

function getTweet($userId, $tweetId) {
           
    require(__DIR__.'/../database/mariadb.php');

    try {
        $q = $dbMaria->prepare('SELECT users.user_id, users.user_username, users.user_full_name, tweets.*, tweetslinks.* 
                                FROM users JOIN tweets ON tweets.tweet_user_fk=users.user_id 
                                LEFT OUTER JOIN tweetslinks ON tweets.tweet_id=tweetslinks.tweet_fk 
                                WHERE tweets.tweet_id=:tweet_id LIMIT 1');

    $q->bindValue(":tweet_id", $tweetId);
        $q->execute();

        $aTweet = $q->fetchAll();
        return $aTweet;
        
    } catch (Exception $err) {
        sendError(500, "Cannot get tweets", __LINE__);
    }

    echo '{"error": "User / id does not exist"}';
}

function sendError($iResponseCode, $sMessage, $iLine){
    http_response_code($iResponseCode);
    header('Content-Type: application/json');
    echo '{"message":"'.$sMessage.'", "error":'.$iLine.'}';
    exit();
}

// https://stackoverflow.com/questions/15699101/get-the-client-ip-address-using-php
function get_client_ip() {
    $ipaddress = '';
    if (isset($_SERVER['HTTP_CLIENT_IP']))
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    else if(isset($_SERVER['HTTP_X_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    else if(isset($_SERVER['HTTP_X_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    else if(isset($_SERVER['HTTP_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    else if(isset($_SERVER['HTTP_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    else if(isset($_SERVER['REMOTE_ADDR']))
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}