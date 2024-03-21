const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');

module.exports = {

  doAdminSignup: (userdata) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get.collection(collection.ADMIN_COLLECTIONS).findOne({ email: userdata.email })
      if (user) {
        let response = {}
        response.signupstatus = false
        resolve({ error: 'Signup failed. Email Already Exists! ' })
      } else if (userdata.password !== userdata.rpassword) {
        let response = {}
        response.signupstatus = false
        resolve({ error: 'Passwords do not match' })
      } else {
        console.log(userdata);

        userdata.password = await bcrypt.hash(userdata.password, 10)
        db.get.collection(collection.ADMIN_COLLECTIONS).insertOne(userdata).then((response) => {
          response.signupstatus = true
          response.admin = userdata
          resolve(response)
        })
      }
    })
  },
  doAdminLogin: (userdata) => {

    return new Promise(async (resolve, reject) => {
      let loginStatus = false
      let response = {}
      let user = await db.get.collection(collection.ADMIN_COLLECTIONS).findOne({ email: userdata.email })
      if (user) {
        bcrypt.compare(userdata.password, user.password).then((status) => {
          if (status) {
            console.log("connection established")
            response.admin = user
            response.status = true
            resolve(response)
          }
          else {
            console.log(" connection failed")
            resolve({ status: false })
          }
        })

      }
      else {
        console.log("login failed")
        resolve({ status: false })
      }
    })
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId)
      let users = await db.get.collection(collection.USER_COLLECTIONS).find({}).toArray()
      // userId: new objectID(userId) 
      // console.log(orders)
      resolve(users)
    })

  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId)
      let products = await db.get.collection(collection.PRODUCT_COLLECTION).find({}).toArray()
      // userId: new objectID(userId) 
      // console.log(orders)
      resolve(products)
    })

  },
  getAllReviews: () => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId)
      let users = await db.get.collection(collection.REVIEW_COLLECTION).find({}).toArray()
      // userId: new objectID(userId) 
      // console.log(orders)
      resolve(users)
    })

  },
  postReview: (userdata) => {
    return new Promise(async (resolve, reject) => {

      db.get.collection(collection.REVIEW_COLLECTION).insertOne(userdata).then((response) => {
        resolve(response)
      })

    })
  },
};
