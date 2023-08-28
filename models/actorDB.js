// NAME: Edward Tan Yuan Chong

// Import dbConfig module.
const db = require("./dbConfig");

// Declare actor as object.
const actor = {};

// Create actor API. (actor.html)
actor.createActor = (actorInfo,callback)=>{
    var conn = db.getConnection();
    var createActorStatement = "INSERT INTO `bed_dvd_db`.`actor` (`first_name`, `last_name`) VALUES (? , ?);"; 
    conn.query(createActorStatement,[actorInfo.first_name,actorInfo.last_name],(err,result)=>{ 
        conn.end(); 
        if(err) { 
            return callback(err,null);
        } else { 
            return callback(null,result.insertId); 
        }
    });
}

// Export actorDB.js module line.
module.exports = actor;