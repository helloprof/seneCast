var mongoose = require("mongoose")
var Schema = mongoose.Schema

var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [
        {
            "dateTime": Date,
            "userAgent": String
        }
    ]
})

let User;

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGO_HOST_URI)
        db.on("error", (err) => {
            console.log("MONGO ERR: "+err)
            reject(err)
        })

        db.once("open", () => {
            User = db.model("users", userSchema)
            console.log("MONGO CONNECTED SUCCESSFULLY!")
            resolve()
        })
    })
}

module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("PASSWORDS DO NOT MATCH!")
        } else {
            console.log("success")
            let newUser = new User(userData)
            newUser.save().then(() => {
                resolve()
            }).catch((err) => {
                if(err.code == 11000) {
                    reject("USERNAME ALREADY EXISTS!")
                } else {
                    reject("ERROR SAVING USER:" +err)
                }
            })
        }
    })
}