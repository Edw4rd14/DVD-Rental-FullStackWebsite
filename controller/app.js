// NAME: Edward Tan Yuan Chong

// Import modules needed.
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
var app = express();

// Import database & configuration functions.
const config = require("../models/config");
const login = require("../models/login");
const film = require("../models/filmDB");
const actor = require("../models/actorDB");
const customer = require("../models/customerDB");

// Middleware used.
app.use(express.json());
app.use(express.static("../public"));
app.use(cors('http://localhost:3000'));

// Set JWT private key as variable
var jwt_pte_key = config.jwt_pte_key;

// Verify login function
function verifyToken(req,res,next){
    var token = req.headers.authorization;
    if(!token||!token.includes("Bearer")) {
        res.status(401).send({error_msg:"Unauthorized Request. Please re-login."});
    } else {
        jwt.verify(token.split("Bearer ")[1],jwt_pte_key,(err,decoded)=>{
            if(err) {
                res.status(401).send({error_msg:"Unauthorized Request. Please re-login."});
            } else {
                req.auth = decoded; 
                next();
            }
        });
    }
}

// Verify staff login API (login.html)
app.post('/staffLogin',(req,res)=>{
    login.verifyStaffLogin(req.body.email,req.body.password,(err,result)=>{
        if(err) {
            res.status(500).send({error_msg : "Sorry, something went wrong."});
        } else if(result.length < 1) {
            res.status(401).send({error_msg:"Invalid email and password combination."});
        } else {
            var jwtoken = jwt.sign({active:result[0].active,role:1,staff_id:result[0].staff_id},jwt_pte_key,{expiresIn:"6h"});
            res.status(200).send({status:"admin",token:jwtoken,staff_name:result[0].first_name});
        }
    });
});

// Verify customer login API (login.html) --> Additional modification
app.post('/customerLogin',(req,res)=>{
    login.verifyCustomerLogin(req.body.email,req.body.password,(err,result)=>{
        if(err) {
            res.status(500).send({error_msg : "Sorry, something went wrong."}); 
        } else if(result.length < 1) {
            res.status(401).send({error_msg:"Invalid email and password combination."});
        } else {
            var jwtoken = jwt.sign({active:result[0].active,role:0,customer_id:result[0].customer_id},jwt_pte_key,{expiresIn:"6h"}); 
            res.status(200).send({status:"customer",token:jwtoken});
        }
    });
});

// Get categories API (index.html)
app.get("/categories",(req,res)=>{
    film.getCategories((err,result)=>{
        if(err) {
            res.status(500).send({error_msg: "Sorry, something went wrong."});
        } else {
            res.status(200).send(result);
        }
    });
});

// Search DVD by title/category + maximum price API (index.html)
app.get("/searchDVD",(req,res)=>{
    film.search(req.query.title,req.query.category,req.query.maxPrice,(err,result)=>{
        if(err) {
            res.status(500).send({error_msg: "Sorry, something went wrong."});
        } else { 
            res.status(200).send(result);
        }
    });
});

// More details of DVD API (details.html)
app.get("/details/:film_id",(req,res)=>{
    film.getDetails(req.params.film_id,(err,result)=>{
        if(err) {
            res.status(500).send({error_msg: "Sorry, something went wrong."});
        } else {
            names=[];
            if(result[0].first_name == null) {
                nameString=null;
            } else {
                for(i in result){
                    names.push(`${result[i].first_name} ${result[i].last_name}`);
                }
                nameString = names.join(', ');
            }
            res.status(200).send({category:result[0].name,names:nameString,description:result[0].description});
        }
    });
});

// Store Selection API (customer.html)
app.get("/storelocation",(req,res)=>{
    customer.storelocation((err,result)=>{
        if(err){
            res.status(500).send({error_msg: "Sorry, something went wrong."});
        } else {
            res.status(200).send(result);
        }
    });
});

// Create actor API (ADMIN ONLY) (actor.html)
app.post("/actor",verifyToken,(req,res)=>{
    if(req.auth.active == 1 && req.auth.role == 1) {
        if(req.body.first_name == "" || req.body.last_name == "") { 
            res.status(400).send({error_msg : "Missing Information. Please fill in all required* fields."});
        } else {
            actor.createActor(req.body,(err,result)=>{ 
                if(err){
                    res.status(500).send({error_msg : "Sorry, something went wrong."});
                } else { 
                    res.status(201).send({actor_id : result.toString()});
                }
            });
        }
    } else {
        if(req.auth.active == 1) {
            error_message = {error_msg:"Unauthorized Request. Please re-login."};
        } else {
            error_message = {error_msg:"Inactive Account. Please try a different account."};
        }
        res.status(401).send(error_message);
    }
});


// Create customer API (ADMIN ONLY) (customer.html)
app.post("/customer",verifyToken,(req,res)=>{
    if(req.auth.active == 1 && req.auth.role == 1){
        var missingError = false;
        const arrayOfMainKeys = ["store_id","first_name","last_name","email","address",'password']; 
        const arrayOfAddressKeys = ["address_line1","district","city_id","postal_code","phone"]; 
        try { 
            for(key in arrayOfMainKeys) { 
                if(!Object.keys(req.body).includes(arrayOfMainKeys[key]) || req.body[arrayOfMainKeys[key]] == "") 
                    missingError = true;
            }
            for(key in arrayOfAddressKeys) {
                if(!Object.keys(req.body.address).includes(arrayOfAddressKeys[key]) || req.body.address[arrayOfAddressKeys[key]] == "")
                    missingError = true;
            }
        } catch {
            missingError = true;
        }
        if(missingError) {
            res.status(400).send({error_msg : "Missing Information. Please fill in all required* fields."});
        } else { 
            customer.addCustomer(req.body,(err,result)=>{ 
                if(err === null) { 
                    res.status(200).send({customer_id: result.toString()});
                } else if(err.code == "ER_DUP_ENTRY") { 
                    res.status(409).send({error_msg: "Email Already Exists."});
                } else{
                    res.status(500).send({error_msg: "Sorry, something went wrong."});
                }
            });
        }
    } else {
        if(req.auth.active == 1) {
            error_message = {error_msg:"Unauthorized Request. Please re-login."};
        } else {
            error_message = {error_msg:"Inactive Account. Please try a different account."};
        }
        res.status(401).send(error_message);
    }
});


// ADDITIONAL ENDPOINTS/API

// Get reviews API (details.html)
app.get("/reviews/:film_id",(req,res)=>{
    film.getReviews(req.params.film_id,(err,result)=>{
        if(err) {
            res.status(500).send({error_msg: "Sorry, something went wrong."});
        } else if (result.length == 0){
            res.status(204).send({error_msg:"No Reviews Made."});
        } else {
            res.status(200).send(result);
        }
    });
});

// Add review API (CUSTOMER) (details.html)
app.post("/addReview",verifyToken,(req,res)=>{
    if(req.auth.role==0 && req.auth.active==1 && req.body.review.length <= 250){
        film.addReview(req.body.film_id,req.auth.customer_id,req.body.customer_rating,req.body.review,(err,result)=>{
            if(err) {
                res.status(500).send({error_msg: "Sorry, something went wrong."});
            } else {
                res.status(201).send({success_msg:"Review Successfully Created. Refreshing page..."});
            }
        });
    } else { 
        if(req.auth.role != 0) {
            error_message = {error_msg: "Unauthorized Request. Please re-login."};
        } else if (req.auth.active != 1) {
            error_message = {error_msg:"Inactive Account. Please contact staff for support."};
        } else {
            error_message = {error_msg: "Please enter a review within character limit."};
        }
        res.status(401).send(error_message);
    }
});

// View a customer's reviews API (CUSTOMER) (customerreview.html)
app.get("/customerReview",verifyToken,(req,res)=>{
    if(req.auth.role == 0) { 
        customer.getReviews(req.auth.customer_id,(err,result)=>{
            if(err) {
                res.status(500).send({error_msg: "Sorry, something went wrong."});
            } else if (result.length == 0){
                res.status(204).send({error_msg:"No Reviews Made."});
            } else {
                res.status(200).send(result);
            }
        });
    } else {
        res.status(401).send({error_msg:"Unauthorized Request. Please re-login."});
    }
});

// Delete customer review API (CUSTOMER) (customerreview.html)
app.delete("/deleteReview/:review_id",verifyToken,(req,res)=>{
    if(req.auth.role == 0) { 
        film.deleteReview(req.params.review_id,req.auth.customer_id,(err,result)=>{
            if(err) {
                res.status(500).send({error_msg: "Sorry, something went wrong."});
            } else if (result.affectedRows == 0) {
                res.status(204).send({error_msg: "Delete was unsuccessful."});
            } else {
                res.status(200).send({success_msg: "Review successfully deleted. Refresh to view changes."});
            }
        });
    } else { 
        res.status(401).send({error_msg:"Unauthorized Request. Please re-login."});
    }
});

// Export app.js as module line.
module.exports = app;