<?php

$unparsed_json = file_get_contents("../countries/countries_small.json");

$output = json_decode($unparsed_json);

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 

?>