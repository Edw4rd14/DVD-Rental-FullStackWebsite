// NAME: Edward Tan Yuan Chong

// Import dbConfig module.
const db = require("./dbConfig");

// Declare film as object
const film = {};

// search DVD API. (index.html)
film.search = (title,category,maxPrice,callback)=>{
    var conn = db.getConnection();
    var searchArray = []; 
    var searchStatement = "SELECT film.film_id,film.title,film.release_year,film.rating FROM bed_dvd_db.film INNER JOIN film_category ON film.film_id = film_category.film_id INNER JOIN category ON film_category.category_id = category.category_id WHERE ";   
    if(title != null) {
        searchStatement += "INSTR(film.title,?) AND  ";
        searchArray.push(title);
    }
    if(category != null) {
        searchStatement += "category.name = ? AND  ";
        searchArray.push(category);
    }
    if(maxPrice != undefined) {
        searchStatement += "film.rental_rate <= ?      ";
        searchArray.push(maxPrice);
    }
    conn.query(searchStatement.slice(0,-6) + ";",searchArray,(err,result)=>{
        conn.end();
        if(err) {
            return callback(err,null);
        } else {
            return callback(null,result);
        }
    });
}

// Get categories API. (index.html)
film.getCategories = (callback)=>{
    var conn = db.getConnection();
    var getCategoryStatement = 'SELECT name FROM bed_dvd_db.category;';
    conn.query(getCategoryStatement,[],(err,result)=>{
        conn.end();
        if(err) {
            return callback(err,null);
        } else {
            return callback(null,result);
        }
    });
}

// Get film details API. (details.html)
film.getDetails = (film_id,callback)=>{
    var conn = db.getConnection();
    var getDetailStatement = "SELECT category.name,film.description,actor.first_name,actor.last_name FROM film LEFT JOIN film_category ON film.film_id = film_category.film_id LEFT JOIN category ON film_category.category_id = category.category_id LEFT JOIN film_actor ON film.film_id = film_actor.film_id LEFT JOIN actor ON actor.actor_id = film_actor.actor_id WHERE film.film_id = ?;";
    conn.query(getDetailStatement,[film_id],(err,result)=>{
        conn.end();
        if(err) {
            return callback(err,null);
        } else {
            return callback(null,result);
        }
    });
}

// Get all reviews for film API. (details.html)
film.getReviews = (film_id,callback)=>{
    var conn = db.getConnection();
    var getReviewStatement = "SELECT customer.first_name,customer.last_name,film_review.customer_rating,film_review.review,DATE_FORMAT(film_review.created_at,'%Y-%m-%d') AS created_at FROM film_review INNER JOIN customer ON customer.customer_id = film_review.customer_id WHERE film_review.film_id = ?;";
    conn.query(getReviewStatement,[film_id],(err,result)=>{
        conn.end();
        if(err) {
            return callback(err,null);
        } else {
            return callback(null,result);
        }
    });
}

// Add customer review API. (details.html)
film.addReview = (film_id,customer_id,customer_rating,review,callback)=>{
    var conn = db.getConnection();
    var addReviewStatement = "INSERT INTO `bed_dvd_db`.`film_review` (`film_id`, `customer_id`, `customer_rating`, `review`) VALUES (?, ?, ?, ?);";
    conn.query(addReviewStatement,[film_id,customer_id,customer_rating,review],(err,result)=>{
        conn.end();
        if(err) {
            return callback(err,null);
        } else {
            return callback(null,result);
        }
    });
}

// Delete customer review API. (customerreview.html)
film.deleteReview = (review_id,customer_id,callback)=>{
    var conn = db.getConnection();
    var deleteReviewStatement = "DELETE FROM film_review WHERE review_id = ? AND customer_id = ?;";
    conn.query(deleteReviewStatement,[review_id,customer_id],(err,result)=>{
        conn.end();
        if(err) {
            return callback(err,null);
        } else {
            return callback(null,result);
        }
    });
}
module.exports = film;