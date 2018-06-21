let express = require('express');
let fs = require('fs');// required to read the files from the file system.
let server = new express(); // you are creating a new server..
let bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true})); // this to handle the encoded bodies.
server.use(express.static('public'));
server.listen(8090);