<?php

session_start();
if(!isset($_SESSION['id']) && !isset($_SESSION['name'])) {
    echo 0;
    exit();
} else {
    echo $_SESSION['id'];
    exit();
};
