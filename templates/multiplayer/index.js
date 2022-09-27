const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const Datauri = require('datauri/parser');
const datauri = new Datauri();
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const port = 8080;

app.use(express.static(__dirname + '/gameclient'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/gameclient/index.html');
});

function setupGameServer() {
    JSDOM.fromFile(path.join(__dirname, 'gameserver/index.html'), {
        // To run the scripts in the html file
        runScripts: "dangerously",
        // Also load supported external resources
        resources: "usable",
        // So requestAnimatinFrame events fire
        pretendToBeVisual: true
    }).then((dom) => {
        dom.window.URL.createObjectURL = (blob) => {
            if (blob) {
                return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
            }
        };
        dom.window.URL.revokeObjectURL = (objectURL) => { };
        dom.window.gameLoaded = () => {
            server.listen(port, function () {
                console.log(`Listening on ${server.address().port}`);
            });
        };
        dom.window.io = io;
    }).catch((error) => {
        console.log(error.message);
    });
}

setupGameServer();
