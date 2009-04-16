<?php

/***********************************
  this is for demo use only. not intended for use in production environments.
************************************ */

// kill this page if someone goes here directly.
if (empty($_POST)) : 
  echo 'sorry, you must have arrived here accidentally';
  exit();
endif;

// boolean to check if this is an ajax request or not
$ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? $_SERVER['HTTP_X_REQUESTED_WITH'] : false;

// set up server-side validation rules
$prohibited_emails = array('karl@learningjquery.com', 'joe@example.com');
$required_fields = array('full_name', 'email');
$email_fields = array('email');
$emailFormat = '/\S+@[.-_a-zA-Z]+\.\w{2,4}/';

// set up form response
$response = array(
  'message' => 'Thank you for sending your comment! Message received.',
  'error_length' => 0,
  'errors' => array(),
  'successes' => array()
);

//  validate the fields
foreach ($_POST as $field => $value) {
  if (in_array($field, $required_fields) && !trim($value)) {
    $response['errors'][$field] = ' required field';
    $response['error_length']++;
  } elseif (in_array($field, $email_fields) && !preg_match($emailFormat,$value)) {
    $response['errors'][$field] = ' incorrectly formatted';
    $response['error_length']++;
  }
}
if (in_array($_POST['email'], $prohibited_emails)):
  $response['errors']['email'] = $_POST['email'] . ' prohibited';
  $response['error_length']++;
endif;

// create the message intro
$errors = $response['error_length'];
if ($errors) {
  $fields = ($errors == 1) ? ' field' : ' fields';
  $response['message'] = '<div>Sorry, but something is still wrong with ' . $errors . $fields . ':</div>';
}

// if this is an ajax request, 
// convert the $response associative array to a json object and echo it
if ($ajax):
  echo json_encode($response);
  
// otherwise, show the $response in a page
else:  
?>
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <title>TinyValidate jQuery Plugin</title>
    <link rel="stylesheet" type="text/css" href="../extras/screen.css" media="screen, projection">  
  </head>
  <body>
    <div class="container">
      <h1>ajaxForm Example - TinyValidate jQuery Plugin</h1>
      <h2>Form Response</h2>
      <p><?= $response['message']; ?> </p>
      <?php
      if ($response['error_length']):
      ?>
      <div class="error">
      <ul>
        <?php foreach ($response['errors'] as $key => $value): ?>
          <li><?= $key . ': ' . $value; ?></li>
        <?php endforeach; ?>
      </ul>
      </div>
      <p>Please return to <a href="<?= $_SERVER['HTTP_REFERER'] ?>">the previous page</a>.</p>
      <?php endif; ?>  
    </div>
  </body>
  </html>

<?php
endif;
?>