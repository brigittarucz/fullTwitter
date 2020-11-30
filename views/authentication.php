<?php

    // IIFE used to return - exit() stops the page execution

    // Format in users.txt: {"title":"title A"}
    // array_push($s, ['title' => 'title A']);
    
    // Format in users.txt: ["title B"]
    // array_push($s, ['title B']);

    session_start();

    if(isset($_SESSION['name']) && isset($_SESSION['id'])) {
        header('Location: home');
    }

    (function() { 
        if(isset($_POST['email']) && isset($_POST['password'])) {
            
            // TODO: validate
            
            if(! filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
                echo 'Invalid email';
                return;
            }

            if(! strlen($_POST['password']) >= 8) {
                echo 'Password must have a minimum of 8 chars';
                return;
            }

            require_once('../controllers/functions.php');
            $validUser = postUser($_POST['email'],$_POST['password']);

            if(!$validUser) {
                echo 'Improper login credentials';
            } else {
                $validUser = json_decode($validUser);
                session_start();
                $_SESSION['id'] = $validUser->id;
                $_SESSION['name'] = $validUser->name;

                header("Location: home");
            }
        
        } 

    })();

    (function() {
        if(isset($_POST['signupName']) && 
        isset($_POST['signupEmail'])  &&
        !empty($_POST['signupMonth']) && 
        !empty($_POST['signupDay']) && 
        !empty($_POST['signupYear']) &&
        isset($_POST['signupPassword']) &&
        isset($_POST['signupRepeatPassword'])) {
            
            if( !(strlen($_POST['signupName']) >= 4)) {
                echo 'Name must have at least 4 characters';
                return;
            }

            if( !(strlen($_POST['signupName']) <= 30)) {
                echo 'Name must not have more than 30 characters';
                return;
            }

            if(!filter_var($_POST['signupEmail'], FILTER_VALIDATE_EMAIL)) {
                echo 'Invalid email format';
                return;
            }

            if(!(strlen($_POST['signupPassword']) >= 8)) {
                echo 'Password must have over 8 characters';
                return;
            }

            if( $_POST['signupPassword'] != $_POST['signupRepeatPassword']) {
                echo 'Passwords must match';
                return;
            }
            
            $day = $_POST['signupDay'];
            $month = $_POST['signupMonth'];
            $year = $_POST['signupYear'];

            $userBirthdate = new DateTime("$year-$month-$day");
            $currentDate = new DateTime();

            if(! (date_diff($userBirthdate, $currentDate)->y >= 13)) {
                echo 'Not old enough to use Twitter';
                return;
            }

            require_once('../controllers/functions.php');

            $user = createUser($_POST['signupEmail'], $_POST['signupPassword'], $_POST['signupName'], date_format($userBirthdate,"Y-m-d"));

            if(!$user) {
                echo 'Email already exists';
                return;
            } else {

            $validUser = json_decode($user);
            session_start();
            $_SESSION['id'] = $validUser->user_id;
            $_SESSION['name'] = $validUser->user_username;

            print_r($validUser);

            header("Location: home");
            }

        } 
    })();

 
      
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login on Twitter / Twitter</title>
    <link rel="stylesheet" type="text/css" href="../app.css">
</head>

<body>

    <main id="auth-page">

        <section id="auth-page_header">
            <svg viewBox="0 0 24 24" class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-j66t93 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr">
                <g>
                    <path
                        d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z">
                    </path>
                </g>
            </svg>
            <h1 class="text-lg-dark-900">Log in to Twitter</h1>
        </section>

        <section id="auth-page_form">
            <form class="login-form" action="authenticate" method="POST">
                <div class="form-group">
                    <label class="text-sm">Email</label>
                    <input type="text" name="email" required value="web.dev3232@gmail.com">
                </div>
                <div class="form-group">
                    <label class="text-sm">Password</label>
                    <input type="text" name="password" required value="newPassword">
                </div>
                <button type="submit" class="btn">Log In</button>
                <!-- // <?php 
                // if(isset($emailErrMsg)) {
                // echo $emailErrMsg; 
                // exit();
                // } ?> -->
            </form>
        </section>

        <section id="auth-page_links">
            <a href="password-reset">Forgot password? &#8226; </a>
            <a href="/" onclick="openModal(); return false;" data-queryElement="#modal-signup">Sign up for Twitter</a>
        </section>

    </main>

    <div id="modal-signup">
        <div class="modal-signup_content">
            <section class="signup-header">
                <div>
                    <a href="/" onclick="closeModal(); return false;" data-queryElement="#modal-signup">
                        <svg viewBox="0 0 24 24"
                            class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-1q142lx r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue">
                            <g>
                                <path
                                    d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z">
                                </path>
                            </g>
                        </svg>
                    </a>
                </div>
                <svg viewBox="0 0 24 24"
                    class="r-13gxpu9 r-4qtqp9 r-yyyyoo r-j66t93 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr">
                    <g>
                        <path
                            d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z">
                        </path>
                    </g>
                </svg>

            </section>
            <section class="signup-form">
                <h3 class="text-lg-dark-900">Create your account</h3>
                <form class="signup-form_form" method="POST">
                    <div class="form-set-v2">
                        <div class="form-group">
                            <label class="text-sm">Name</label>
                            <input type="text" name="signupName" value="Brigitta Rucz">
                        </div>
                        <div class="form-group">
                            <label class="text-sm">Email</label>
                            <input type="text" name="signupEmail" value="brigitta@yahoo.com">
                        </div>
                        <div class="form-group">
                            <label class="text-sm">Password</label>
                            <input type="text" name="signupPassword" value="password1">
                        </div>
                        <div class="form-group">
                            <label class="text-sm">Repeat Password</label>
                            <input type="text" name="signupRepeatPassword" value="password1">
                        </div>
                    </div>
                    <a href="/">Use phone instead</a>
                    <h4>Date of birth</h4>
                    <p class="text-sm">This will not be shown publicly. Confirm your own age, even if this account is
                        for a business, a pet, or something else.</p>
                    <div class="form-set">
                        <div class="form-group">
                            <label class="text-sm">Month</label>
                            <select name="signupMonth">
                                <option>March</option>
                                <?php
                                    $months = ['January', 'February', 'March','April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                                    for($i = 0; $i < 12; $i++) {
                                        echo "<option value='$i'>$months[$i]</option>";
                                    }
                                ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="text-sm">Day</label>
                            <select name="signupDay">
                                <option>1</option>
                                <?php
                                    for($i = 0; $i < 32; $i++) {
                                        echo "<option value='$i'>$i</option>";
                                    }
                                ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="text-sm">Year</label>
                            <select name="signupYear">
                                <option>1998</option>
                                <?php
                                    for($i = date("Y"); $i >= 1930; $i--) {
                                        echo "<option value='$i'>$i</option>";
                                    }
                                ?>
                            </select>
                        </div>
                    </div>
                    <button class="btn" type="submit">Next</button>
                </form>
            </section>
        </div>
    </div>

    <script src="../app.js"></script>
</body>

</html>