<?php

try {

    require_once('controllers/functions.php');

    if(!isset($_POST['passwordNew'])) {
        sendError(400, "New password is not set", __LINE__);
    }

    if(!isset($_POST['passwordOld'])) {
        sendError(400, "Old password is not set", __LINE__);
    }

    if(!isset($_POST['userId'])) {
        sendError(400, "User id is not set", __LINE__);
    }

    $status = updatePassword($_POST['passwordOld'], $_POST['passwordNew'], $_POST['userId']);
    // $status = json_decode($status);

    // 404 can both mean no match user_id / user_password 
    echo $status;

} catch (Exception $err) {
    sendError(500, 'Error on update', __LINE__);
}
