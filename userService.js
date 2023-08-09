var mongoose = require("mongoose")
var Schema = mongoose.Schema
const bcrypt = require("bcryptjs")

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

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGO_HOST_URI)
    db.on("error", (err) => {
      console.log("MONGO ERR: " + err)
      reject(err)
    })

    db.once("open", () => {
      User = db.model("users", userSchema)
      console.log("MONGO CONNECTED SUCCESSFULLY!")
      resolve()
    })
  })
}

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (userData.password != userData.password2) {
      reject("PASSWORDS DO NOT MATCH!")
    } else {
      bcrypt.hash(userData.password, 10).then((hash) => {
        userData.password = hash

        let newUser = new User(userData)
        newUser.save().then(() => {
          resolve("USER CREATION SUCCESSFUL!")
        }).catch((err) => {
          if (err.code == 11000) {
            reject("USERNAME ALREADY EXISTS!")
          } else {
            reject("ERROR SAVING USER")
          }
        })
      }).catch((err) => {
        console.log(err)
        reject("PASSWORD ENCRYPTION ERROR")
      })

    }
  })
}

module.exports.loginUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.findOne({userName: userData.userName})
    .exec()
    .then((user) => {
      bcrypt.compare(userData.password, user.password).then((result) => {
        console.log(result)
        if (result) {
          user.loginHistory.push({dateTime: new Date(), userAgent: userData.userAgent})
          User.updateOne(
            { userName: user.userName },
            { $set: { loginHistory: user.loginHistory}}
          ).exec()
          .then(() => {
            resolve(user)
          }).catch((err) => {
            reject("ERROR UPDATING LOGIN HISTORY")
            console.log(err)
          })
        } else {
          reject("CREDENTIALS INCORRECT: TRY AGAIN!")
        }
      }).catch((err) => {
        console.log(err)
        reject("CREDENTIALS INCORRECT: TRY AGAIN!")
      })
    }).catch((err) => {
      reject("CREDENTIALS INCORRECT: TRY AGAIN!")
    })
  })
}