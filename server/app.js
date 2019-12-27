const express = require("express");
var cors = require("cors");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const expressValidator = require("express-validator");
const { corsorigin = [], port } = require("./config/config");

//BASE URL
app.get("/", function(req, res) {
  res.send("You are now connected to tricog. ");
});

// DIFFERENT ROUTES
const authenticationRoutes = require("./api/routes/authentication");
const customerRoutes = require("./api/routes/customer");
const fileUploadRoutes = require("./api/routes/fileupload");
const s3UploadRoutes = require("./api/routes/s3Upload");
const testUploadRoutes = require("./api/routes/testUpload");

//MYSQL CONNECTION
var connection = mysql.createPool({
  host: "sql156.main-hosting.eu",
  user: "u341442618_trico",
  password: "ojA5x1dgBT5r",
  database: "u341442618_trico"
});

connection.getConnection(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("dbserver connected");
});

//LOGGING
app.use(morgan("dev"));

//STATIC UPLOAD FOLDER
app.use("/uploads", express.static("uploads"));

//CORS HEADERS
app.use(
  cors({
    origin: corsorigin || [],
    credentials: true
  })
);

//BODY PARSER MIDDLEWARE
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(expressValidator());

//ROUTES URL FOR API ACCESS
app.use("/api/auth", authenticationRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/file", fileUploadRoutes);
app.use("/api/s3", s3UploadRoutes);
app.use("/api/test", testUploadRoutes);

// app.use("/api/chunk/file", chunkFileUploadRoutes);

//ERROR HANDLING
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
