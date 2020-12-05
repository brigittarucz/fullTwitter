<?php
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\SMTP;
    use PHPMailer\PHPMailer\Exception;

try {

    require_once('../controllers/functions.php');

    if(!isset($_POST['email'])) {
        sendError(400, "Email is not set", __LINE__);
    }

    if(!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
        sendError(400, "Email is not valid", __LINE__);
    }

    $hash = getEmail($_POST['email']);

    if($hash == '404') {
        sendError(404, "Email not found", __LINE__);
    } else if($hash == '500' ) {
        sendError(500, "Server error", __LINE__);
    } else if ($hash == '400' ) {
        sendError(400, "Update failed", __LINE__);
    } else {
        $hash = json_decode($hash);
        $hash = rtrim($hash, '"');
        $hash = ltrim($hash, '"');
        $sendNow = 1;
    }


    if(isset($sendNow)) {
    
        require '../PHPMailer/src/Exception.php';
        require '../PHPMailer/src/PHPMailer.php';
        require '../PHPMailer/src/SMTP.php';

        $mail = new PHPMailer(true);

        try {
            //Server settings
            $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      // Enable verbose debug output
            $mail->isSMTP();                                            // Send using SMTP
            $mail->Host       = 'smtp.gmail.com';                    // Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
            $mail->Username   = 'web.dev3232@gmail.com';                     // SMTP username
            $mail->Password   = 'p@ssw3bd3v1';                               // SMTP password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
            $mail->Port       = 587;                                    // TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above

            //Recipients
            $mail->setFrom('web.dev3232@gmail.com', 'Mailer');
            $mail->addAddress($_POST['email'], 'Brigitta');     // Add a recipient

            // Content
            $mail->isHTML(true);                                  // Set email format to HTML
            $mail->Subject = 'Password Reset';
            $mail->Body    = "Access the following link <a href='http://localhost/views/new-password.php?password=$hash' target='_blank'>password-reset-email.php?password=$hash</a>
            in order to reset your password. Your current password is $hash .";
            // $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

            $mail->send();
            // echo 'Message has been sent';
            echo '200';
        } catch (Exception $e) {
            // echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
        }
    }


} catch (Exception $err) {
    sendError(500, "Error on message sent", __LINE__);
}