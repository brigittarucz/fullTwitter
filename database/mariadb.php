<?php

try{
  $dbUserName = 'root';
  $dbPassword = ''; // root | admin
  $dbConnection = 'mysql:host=localhost; dbname=twitter_exam; charset=utf8mb4'; 

  $options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // try-catch
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ
    // PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    // PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_NUM
  ];
  $dbMaria = new PDO(  $dbConnection, 
                  $dbUserName, 
                  $dbPassword , 
                  $options );
  
}catch(PDOException $ex){
  http_response_code(500);
  header('Content-Type: application/json');

  // Do not echo the $ex for security reasons
  // echo $ex;

  echo '{"message": "Contact the system admin about error:'.__LINE__ . $ex.'"}';
  exit();
}















