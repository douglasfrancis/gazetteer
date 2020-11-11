<?php

$url= "../countries/countries_small.json";

$handle = curl_init();
curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
curl_setopt($handle, CURLOPT_URL,$url);

$result=curl_exec($handle);

curl_close($handle);

$decode = json_decode($result,true);	

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $decode[0];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 
?>