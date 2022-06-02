// modules
const express = require("express");
const sessions = require("express-session");

// constants
const app = express();
const port = 3000;

// middleware
app.use(sessions({
    secret: "this is the secret"
}));

// globals
let coordinates = [];
let globalWidth = 0;
let globalHeight = 0; 

// routes
app.get("/", (req, res) => {
    res.sendFile("index.html", {root: __dirname});
    console.log("session id:", req.session.id);
});

app.get("/wh", (req, res) => {
    globalWidth = req.query['width'];   
    globalHeight = req.query['height'];
});


app.get("/data", (req, res) => {
    coordinates.push([Number(req.query['x']), Number(req.query['y'])]);   

    res.send("Thank you")
});

app.get("/coordinates", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({
        coordinates: coordinates
    });
});

app.get("/alarmsound", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile("Popular Alarm Clock Sound Effect.mp3", {root: __dirname});
});

app.get("/metrics", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    res.json({
        center_avg: centerAverage(coordinates),
        variance: variance(coordinates),
        average: average(coordinates)
    });
    coordinates = [];
});

app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`listening at port ${port}`);
});

// metrics
function centerAverage(coordinates) {
    let width = globalWidth == 0 ? 1440 : globalWidth; 
    let height = globalHeight == 0 ? 725 : globalHeight;
    let center = [width / 2, height / 2]
    let n = coordinates.length;
    
    let res = 0
    for (var i = 0; i < n; i++) {
        res += Math.sqrt( 
            Math.pow(coordinates[i][0] - center[0], 2) +
            Math.pow(coordinates[i][1] - center[1], 2)
        );
    }
    return (res / n);
}

function average(coordinates) {
    let xMean = 0;
    let yMean = 0;
    let n = coordinates.length;

    for (var i = 0; i < n; i++) {
        xMean += coordinates[i][0];
        yMean += coordinates[i][1];
    }
    xMean = (xMean / n);
    yMean = (yMean / n);
    let average = [xMean, yMean];

    return average;
}

function variance(coordinates) {
    let avg = average(coordinates);
    let xMean = avg[0];
    let yMean = avg[1];
    let xVar = 0;
    let yVar = 0;
    let n = coordinates.length;

    for (var i = 0; i < n; i++) {
        let x = coordinates[i][0];
        let y = coordinates[i][1];
        xVar += Math.pow(x - xMean, 2);
        yVar += Math.pow(y - yMean, 2);
    }
    xVar = (xVar / n - 1);
    yVar = (yVar / n - 1);
    return (xVar + yVar);
}