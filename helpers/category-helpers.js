var db = require('../config/connection')
var collection = require('../config/collection')
const objectID = require('mongodb').ObjectId

module.exports = {
  addCategory: (category, callback) => {
    console.log(category);
    db.get.collection('category').insertOne(category).then((data) => {
      let obj = data.insertedId
      callback(obj)
    })
  },
  getAllCategories: () => {
    return new Promise(async (resolve, reject) => {
      let categories = await db.get.collection(collection.CATEGORY_COLLECTION).find().toArray()
      resolve(categories)
    })
  },
  getOwnerCategories: (id) => {
    return new Promise(async (resolve, reject) => {
      let categories = await db.get.collection(collection.CATEGORY_COLLECTION).find({ ownerId: id }).toArray()
      resolve(categories)
    })
  },
  getCategoryCategories: (cat) => {
    return new Promise(async (resolve, reject) => {
      let categories = await db.get.collection(collection.CATEGORY_COLLECTION).find({ "category": cat }).toArray()
      resolve(categories)
    })
  },
  deleteCategory: (catId) => {
    return new Promise((resolve, reject) => {
      let categoryId = new objectID(catId)
      db.get.collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: categoryId }).then((response) => {
        resolve(response)
      })
    })
  },
  getCategoryDetails: (catId) => {
    return new Promise((resolve, reject) => {
      let categoryId = new objectID(catId)
      db.get.collection(collection.CATEGORY_COLLECTION).findOne({ _id: categoryId }).then((category) => {
        resolve(category)
      })
    })
  },
  updateCategory: (catId, catDetails) => {
    return new Promise((resolve, reject) => {
      let categoryId = new objectID(catId)
      db.get.collection(collection.CATEGORY_COLLECTION).updateOne({ _id: categoryId },
        {
          $set: catDetails
        }).then((response) => {
          resolve()
        }).catch((error) => {
          console.error("Error updating category:", error);
          reject(error);
        });
    })
  }
}
