// NAME: Edward Tan Yuan Chong

// Import dbConfig module.
const db = require("./dbConfig");

// Declare customer as object.
const customer = {};

// Add customer API. (customer.html)
customer.addCustomer = (customerInfo,callback)=>{
    var conn = db.getConnection();
    var addCustomerStatement = "BEGIN; INSERT INTO `bed_dvd_db`.`address` (`address`, `address2`, `district`, `city_id`, `postal_code`, `phone`) VALUES (?,?,?,?,?,?);INSERT INTO `bed_dvd_db`.`customer` (`store_id`, `first_name`, `last_name`, `email`,`address_id`,`password`) VALUES (?,?,?,?,LAST_INSERT_ID(),?);COMMIT;"; 
    conn.query(addCustomerStatement,[customerInfo.address.address_line1,customerInfo.address.address_line2,customerInfo.address.district,customerInfo.address.city_id,customerInfo.address.postal_code,customerInfo.address.phone,customerInfo.store_id,customerInfo.first_name,customerInfo.last_name,customerInfo.email,customerInfo.password],(err,result)=>{ 
        conn.end();
        if(err) { 
            return callback(err,null);
        } else { 
            return callback(null,result[2].insertId);
        }
    });
}

// Get store location API. (customer.html)
customer.storelocation = (callback)=>{
    var conn = db.getConnection(); 
    var getStoreLocationStatement = "SELECT address.address FROM store INNER JOIN address ON address.address_id = store.address_id;"; 
    conn.query(getStoreLocationStatement,[],(err,result)=>{
        conn.end();
        if(err) {
            return callback(err,null);
        } else {
            return callback(null,result);
        }
    });
}

// Get customer reviews API. (customerreview.html)
customer.getReviews = (customer_id,callback)=>{
    var conn = db.getConnection();
    var getCustomerReviewStatement = "SELECT film_review.review_id,film.title,film_review.customer_rating,film_review.review,DATE_FORMAT(film_review.created_at,'%Y-%m-%d %T') AS created_at FROM film_review INNER JOIN film ON film.film_id = film_review.film_id WHERE film_review.customer_id = ?;";
    conn.query(getCustomerReviewStatement,[customer_id],(err,result)=>{
        conn.end();
        if(err) {
            return callback(err,null);
        } else {
            return callback(null,result);
        } 
    });
}

// Export customerDB.js module line.
module.exports = customer;