<?php

require_once(__DIR__.'/../controllers/functions.php');

if(!$_SERVER['REQUEST_METHOD'] === 'POST') {
    sendError(500, "Invalid request method", __LINE__);
}

session_start();

if(!isset($_SESSION['id'])) {
    sendError(400, "Session id not set", __LINE__);
}

if(!isset($_SESSION['name'])) {
    sendError(400, "Session username not set", __LINE__);
}

//https://www.taniarascia.com/how-to-upload-files-to-a-server-with-plain-javascript-and-php/

if(strlen($_FILES['userImage']["name"])) {
    
    $extensions = ['jpg', 'jpeg', 'png'];

    $file['file_type'] = substr($_FILES['userImage']['type'], 6, strlen($_FILES['userImage']['type']));

    $file['file_size'] = $_FILES['userImage']['size'];

    if(!in_array($file['file_type'], $extensions)) {
        sendError(400, "Invalid file type", __LINE__);
    }

    if ($file['file_size'] > 2097152) {
        sendError(400, "File size exceeds limit", __LINE__);
    }

    $path = __DIR__.'/../media/uploads/';

    $name = $_SESSION['name']."-profile.".$file['file_type'];
    $file['file_path'] = $path;
    $file['file_name'] = $name;

    move_uploaded_file($_FILES['userImage']['tmp_name'], $path.$name);

    echo "/media/uploads/".$name;

} else {
    echo 0;
}