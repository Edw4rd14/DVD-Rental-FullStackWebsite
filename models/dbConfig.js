// NAME: Edward Tan Yuan Chong

const mysql = require("mysql");

var dbConnect = {};

dbConnect.getConnection = ()=>{
    var conn = mysql.createConnection({
        "host":"localhost",
        "user":"bed_dvd_root",
        "password":"pa$$woRD123",
        "database":"bed_dvd_db",
        "multipleStatements": true // Allow multiple MySQL statements in 1 query
    });
    return conn;
}

module.exports = dbConnect;