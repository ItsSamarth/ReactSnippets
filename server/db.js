const mysql = require("mysql");

//MYSQL CONNECTION
var connection = mysql.createPool({
  host: "185.201.11.86",
  user: "u341442618_trico",
  password: "ojA5x1dgBT5r",
  database: "u341442618_trico"
});

connection.getConnection(function(err) {
  if (err) throw err;
});

module.exports = connection;
