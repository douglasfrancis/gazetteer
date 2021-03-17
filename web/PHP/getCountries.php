<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "https://restcountries.eu/rest/v2");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$data = curl_exec($ch);

curl_close($ch);

$decode = json_decode($data,true);	

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>