<?php


    try {

    require_once(__DIR__.'/../controllers/functions.php');
    require_once(__DIR__.'/../database/mariadb.php');

    // Comment in production
    // $_GET['id'] = 15;

    if(!isset($_GET['id'])) {
        sendError(400, "User id is not set", __LINE__);
    }

    // if(!isset($_SESSION['name'])) {
    //     sendError(400, "Session name is not set", __LINE__);
    // }

    $q = $dbMaria->prepare('SELECT u.user_username, u.user_full_name, c.country_name, c.country_id, g.gender_name, g.gender_id
                            FROM users AS u 
                            JOIN countries AS c 
                            ON u.user_country_fk=c.country_id 
                            JOIN genders AS g 
                            ON g.gender_id=u.user_gender_fk 
                            WHERE u.user_id=:user_id
                            LIMIT 1');

    $q->bindValue(':user_id', $_GET['id']);
    $q->execute();
    $aUserProfile = $q->fetchAll();

    $apiLookupData["gender"] = $aUserProfile[0]->gender_name;
    $apiLookupData["gender_id"] = $aUserProfile[0]->gender_id;
    $apiLookupData["country"] = $aUserProfile[0]->country_name;
    $apiLookupData["country_id"] = $aUserProfile[0]->country_id;
    $apiLookupData["fullname"] = $aUserProfile[0]->user_full_name;

    $q = $dbMaria->prepare('SELECT * FROM countries WHERE country_id <> :user_country');
    $q->bindValue(':user_country',  $aUserProfile[0]->country_id);
    $q->execute();
    $aCountries = $q->fetchAll();

    $q = $dbMaria->prepare('SELECT * FROM genders WHERE gender_id <> :user_gender');
    $q->bindValue(':user_gender', $aUserProfile[0]->gender_id);
    $q->execute();
    $aGenders = $q->fetchAll();

    $apiLookupData["countries"] = $aCountries;
    $apiLookupData["genders"] = $aGenders;

    echo json_encode($apiLookupData);

    } catch (Exception $ex) {
        sendError(500, "Server error on retrieving lookups", __LINE__);
    }