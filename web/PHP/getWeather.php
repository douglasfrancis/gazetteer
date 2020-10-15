<?php

$url= 'https://api.openweathermap.org/data/2.5/onecall?lat=' . $_REQUEST['lat'] . '&lon=' . $_REQUEST['lon'] . '&unit=metric&exclude=hourly,daily&appid=7bf0dbdfff8222d48bcdc89c0ae22daf';

$handle = curl_init();
curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
curl_setopt($handle, CURLOPT_URL,$url);

$result=curl_exec($handle);

curl_close($handle);

$decode = json_decode($result,true);	

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['data'] = $decode['current'];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>