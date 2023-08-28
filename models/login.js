// NAME: Edward Tan Yuan Chong

// Import dbConfig module.
const db = require("./dbConfig");

// Declare login as object.
var login = {};

// Verify staff login function. (login.html)
login.verifyStaffLogin = (email,password,callback)=>{
    var conn = db.getConnection();
    var checkUserStatement = 'SELECT active,staff_id,first_name FROM staff WHERE email = ? AND password = ?;';
    conn.query(checkUserStatement,[email,password],(err,result)=>{
        conn.end();
        if(err) {
            return callback(err,null);
        } else {
            return callback(null,result);
        }
    });
}

// Verify customer login function. (login.html)
login.verifyCustomerLogin = (email,password,callback)=>{
    var conn = db.getConnection();
    var checkUserStatement = 'SELECT active,customer_id FROM customer WHERE email = ? AND password = ?;';
    conn.query(checkUserStatement,[email,password],(err,result)=>{
        conn.end();
        if(err) {
            return callback(err,null);
        } else {
            return callback(null,result);
        }
    });
}

// Export module line.
module.exports = login;