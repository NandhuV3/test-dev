const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

//parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Angular files
app.use("/", express.static(path.join(__dirname, "angular")));
//cors
app.use((req, res, next) => {
  const corsWhitelist = [
    "https://www.doublemint.app",
    "https://doublemint.app",
    "http://meanapp-env.eba-3zmkem9t.ap-south-1.elasticbeanstalk.com",
    'http://testingmint-env.eba-ka8ykfpn.ap-south-1.elasticbeanstalk.com',
    "http://localhost:1234",
  ];
  if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
  }
  next();
});

//Routes
const routerOne = require("./router/userRoute");
const routerTwo = require("./router/chartRoute");
const CronRouter = require("./cronJob/calculation");

//placing routes
app.use("/user", routerOne);
app.use("/api", routerTwo);
app.use("/cron", CronRouter);

//open page
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "angular", "index.html"));
});


module.exports = app;
