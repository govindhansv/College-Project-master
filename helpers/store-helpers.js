var db = require('../config/connection')
var collection = require('../config/collection')
const objectID = require('mongodb').ObjectId

module.exports = {

    UpdateStore: (catId, catDetails) => {
        return new Promise((resolve, reject) => {
            let categoryId = new objectID(catId)
            db.get.collection(collection.OWNER_COLLECTIONS).updateOne({ _id: categoryId },
                {
                    $set: catDetails
                }).then((response) => {
                    console.log("response",response);
                    resolve()
                }).catch((error) => {
                    console.error("Error updating category:", error);
                    reject(error);
                });
        })
    },
    getStore: (storeId) => {
        return new Promise((resolve, reject) => {
             storeId = new objectID(storeId)
            db.get.collection(collection.OWNER_COLLECTIONS).findOne({ _id: storeId }).then((response) => {
                    console.log("response",response);
                    resolve(response)
                }).catch((error) => {
                    console.error("Error fetching category:", error);
                    reject(error);
                });
        })
    },
    addStore: (storeData, callback) => {
        db.get.collection('stores').insertOne(storeData).then((data) => {
          let storeId = data.insertedId;
          callback(storeId);
        });
      },
      
      getAllStores: () => {
        return new Promise(async (resolve, reject) => {
          let stores = await db.get.collection(collection.OWNER_COLLECTIONS).find().toArray();
          resolve(stores);
        });
      },
      
      getOwnerStores: (ownerId) => {
        return new Promise(async (resolve, reject) => {
          let stores = await db.get.collection('stores').find({ owner: ownerId }).toArray();
          resolve(stores);
        });
      },
      
      deleteStore: (storeId) => {
        return new Promise((resolve, reject) => {
          let storeObjectId = new ObjectID(storeId);
          db.get.collection('stores').deleteOne({ _id: storeObjectId }).then((response) => {
            resolve(response);
          });
        });
      },
      
      getStoreDetails: (storeId) => {
        return new Promise((resolve, reject) => {
          let storeObjectId = new ObjectID(storeId);
          db.get.collection('stores').findOne({ _id: storeObjectId }).then((store) => {
            resolve(store);
          });
        });
      },
      
      updateStore: (storeId, storeDetails) => {
        return new Promise((resolve, reject) => {
          let storeObjectId = new ObjectID(storeId);
          db.get.collection('stores').updateOne({ _id: storeObjectId }, { $set: storeDetails }).then(() => {
            resolve();
          }).catch((error) => {
            console.error("Error updating store:", error);
            reject(error);
          });
        });
      }
      
}
