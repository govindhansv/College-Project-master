var db = require('../config/connection')
var collection = require('../config/collection')
const objectID = require('mongodb').ObjectId

module.exports = {
  addproduct: (products, callback) => {
    console.log(products);
    db.get.collection('products').insertOne(products).then((data) => {
      let obj = data.insertedId

      callback(obj)

    })
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get.collection(collection.PRODUCT_COLLECTION).find().toArray()
      resolve(products)
    })
  },
  getOwnerProducts: (id) => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get.collection(collection.PRODUCT_COLLECTION).find({ ownerId: id }).toArray()
      resolve(products)
    })
  },

  getCategoryProducts: (cat) => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get.collection(collection.PRODUCT_COLLECTION).find({ "category": cat }).toArray()
      resolve(products)
    })
  },
  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      let prId = new objectID(prodId)
      db.get.collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: prId }).then((response) => {
        //console.log(response)
        resolve(response)
      })
    })
  },
  deleteOwner: (prodId) => {
    return new Promise((resolve, reject) => {
      let prId = new objectID(prodId)
      db.get.collection(collection.OWNER_COLLECTIONS).deleteOne({ _id: prId }).then((response) => {
        //console.log(response)
        resolve(response)
      })
    })
  },
  deleteUser: (prodId) => {
    return new Promise((resolve, reject) => {
      let prId = new objectID(prodId)
      db.get.collection(collection.USER_COLLECTIONS).deleteOne({ _id: prId }).then((response) => {
        //console.log(response)
        resolve(response)
      })
    })
  },
  deleteReview: (prodId) => {
    return new Promise((resolve, reject) => {
      let prId = new objectID(prodId)
      db.get.collection(collection.REVIEW_COLLECTION).deleteOne({ _id: prId }).then((response) => {
        //console.log(response)
        resolve(response)
      })
    })
  },

  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      let prId = new objectID(proId)
      db.get.collection(collection.PRODUCT_COLLECTION).findOne({ _id: prId }).then((product) => {
        resolve(product)
      })
    })
  },
  UpdateProduct: (proId, proDetails) => {
    return new Promise((resolve, reject) => {


      /*{ Name:proDetails.name,
          Category:proDetails.category,
        Description:proDetails.description,
        Quantity:proDetails.quantity
      } */
      console.log(proDetails);
      let prId = new objectID(proId)
      db.get.collection(collection.PRODUCT_COLLECTION).updateOne({ _id: prId },
        {
          $set: proDetails

        }).then((response) => {
          resolve()
        }).catch((error) => {
          console.error("Error updating product:", error);
          reject(error);
        });


    });
  },
  updateStatus: (ordId, newObj) => {
    return new Promise((resolve, reject) => {

      let orderId = new objectID(ordId)
      db.get.collection(collection.ORDER_COLLECTIONS).updateOne({ _id: orderId },
        {
          $set: newObj

        }).then((response) => {
          console.log(response);
          resolve()
        }).catch((error) => {
          console.error("Error updating product:", error);
          reject(error);
        });


    })

  }

}