const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { response } = require('express');
const objectID = require('mongodb').ObjectId
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_0x4Ld7jP6e1F8l',
  key_secret: 'SxHg4MJiijy013g3jrCS2myv',
});


module.exports = {
  doSignup: (userdata) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get.collection(collection.USER_COLLECTIONS).findOne({ email: userdata.email })
      if (user) {
        let response = {}
        response.signupstatus = false
        resolve(response)
      } else {
        console.log(userdata);
        userdata.password = await bcrypt.hash(userdata.password, 10)
        db.get.collection(collection.USER_COLLECTIONS).insertOne(userdata).then((response) => {
          response.signupstatus = true
          response.user = userdata
          resolve(response)
        })
      }
    })
  },
  doLogin: (userdata) => {

    return new Promise(async (resolve, reject) => {
      let loginStatus = false
      let response = {}
      let user = await db.get.collection(collection.USER_COLLECTIONS).findOne({ email: userdata.email })
      if (user) {
        bcrypt.compare(userdata.password, user.password).then((status) => {
          if (status) {
            console.log("connection established")
            response.user = user
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
  doOwnerSignup: (userdata) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get.collection(collection.OWNER_COLLECTIONS).findOne({ email: userdata.email })
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
        db.get.collection(collection.OWNER_COLLECTIONS).insertOne(userdata).then((response) => {
          response.signupstatus = true
          response.user = userdata
          resolve(response)
        })
      }
    })
  },
  doOwnerLogin: (userdata) => {

    return new Promise(async (resolve, reject) => {
      let loginStatus = false
      let response = {}
      let user = await db.get.collection(collection.OWNER_COLLECTIONS).findOne({ email: userdata.email })
      if (user) {
        bcrypt.compare(userdata.password, user.password).then((status) => {
          if (status) {
            console.log("connection established")
            response.user = user
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
  addTocart: (proId, userId) => {
    let proObj = {
      item: new objectID(proId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      console.log("string" + userId)
      let usId = new objectID(userId)

      let userCart = await db.get.collection(collection.CART_COLLECTIONS).findOne({ user: usId });
      if (userCart) {
        let proExist = userCart.products.findIndex(product => product.item == proId)
        console.log('proexist' + proExist)
        if (proExist != -1) {
          db.get.collection(collection.CART_COLLECTIONS).updateOne({ user: usId, 'products.item': new objectID(proId) },
            {
              $inc: { 'products.$.quantity': 1 }
            }).then(() => {
              resolve()
            })
        } else {
          console.log(' useercart ');
          console.log(userCart);
          db.get.collection(collection.CART_COLLECTIONS).updateOne({ user: usId }, {

            $push: { products: proObj }

          }).then((response) => {
            console.log("response");
            console.log(response);
            resolve()
          })
        }

      } else {
        console.log(" else block");
        let cartObj = {
          user: usId,
          products: [proObj]

        }
        db.get.collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response) => {
          resolve()
        })
      }
    })
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get.collection(collection.CART_COLLECTIONS).aggregate([{
        $match: { user: new objectID(userId) }
      },
      {
        $unwind: '$products'

      }, {
        $project:
        {
          item: '$products.item',
          quantity: '$products.quantity'
        }
      },
      {
        $lookup: {
          from: collection.PRODUCT_COLLECTION,
          localField: 'item',
          foreignField: '_id',
          as: 'product'
        }
      }, {
        $project: {
          item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
        }
      }

      ]).toArray()

      resolve(cartItems)
    })
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db.get.collection(collection.CART_COLLECTIONS).findOne({ user: new objectID(userId) })
      if (cart) {
        count = cart.products.length

      }

      resolve(count)
    })
  },
  changeProductQuantity: (details) => {
    count = parseInt(details.count)
    quantity = parseInt(details.quantity)
    return new Promise((resolve, reject) => {
      if (count == -1 && quantity == 1) {
        db.get.collection(collection.CART_COLLECTIONS)
          .updateOne({ _id: new objectID(details.cart) },
            {
              $pull: { products: { item: new objectID(details.product) } }
            }).then((response) => {
              resolve({ removeProduct: true })
            })
      }
      else {
        db.get.collection(collection.CART_COLLECTIONS).updateOne({ _id: new objectID(details.cart), 'products.item': new objectID(details.product) },
          {
            $inc: { 'products.$.quantity': count }
          }).then((response) => {
            resolve({ status: true })
          })
      }
    })
  },
  RemoveItembtn: (details) => {

    return new Promise((resolve, reject) => {
      db.get.collection(collection.CART_COLLECTIONS)
        .updateOne({ _id: new objectID(details.cart) },
          {
            $pull: { products: { item: new objectID(details.product) } }
          }).then((response) => {
            resolve({ removeProduct: true })
          })

    })
  }, getTotalAmount: (userId) => {

    return new Promise(async (resolve, reject) => {
      let total = await db.get.collection(collection.CART_COLLECTIONS).aggregate([{
        $match: { user: new objectID(userId) }
      },
      {
        $unwind: '$products'

      }, {
        $project:
        {
          item: '$products.item',
          quantity: '$products.quantity'
        }
      },
      {
        $lookup: {
          from: collection.PRODUCT_COLLECTION,
          localField: 'item',
          foreignField: '_id',
          as: 'product'
        }
      }, {
        $project: {
          item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
        }
      }, {
        $addFields: {
          'product.Price': { $toDouble: '$product.Price' } // Convert Price to double
        }
      }, {
        $group: {
          _id: null,

          total: { $sum: { $multiply: ['$quantity', '$product.Price'] } }
        }
      }

      ]).toArray()
      console.log(" total ")
      console.log(total)
      if (total.length == 0) {
        resolve(0)

      } else {
        resolve(total[0].total)

      }

    })
  },
  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      console.log(order, products, total)
      let status = order['payment-method'] === 'Cash' ? 'placed' : 'pending'
      let orderObj = {
        deliveryDetails: {
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode
        },
        userId: new objectID(order.userId),
        paymentMethod: order['payment-method'],
        products: products,
        totalAmount: total,
        status: status,
        date: new Date()
      }
      db.get.collection(collection.ORDER_COLLECTIONS).insertOne(orderObj).then((data) => {
        db.get.collection(collection.CART_COLLECTIONS).deleteOne({ user: new objectID(order.userId) })
        let obj = data.insertedId
        resolve(obj)
      })

    })

  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log("getcartp" + userId)
      let cart = await db.get.collection(collection.CART_COLLECTIONS).findOne({ user: new objectID(userId) })
      console.log(cart)
      resolve(cart.products)
    })
  },
  getAllOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId)
      let orders = await db.get.collection(collection.ORDER_COLLECTIONS).find({}).toArray()
      // userId: new objectID(userId) 
      console.log(orders)
      resolve(orders)
    })

  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId)
      let orders = await db.get.collection(collection.USER_COLLECTIONS).find({}).toArray()
      // userId: new objectID(userId) 
      // console.log(orders)
      resolve(orders)
    })

  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId)
      let orders = await db.get.collection(collection.PRODUCT_COLLECTION).find({}).toArray()
      // userId: new objectID(userId) 
      // console.log(orders)
      resolve(orders)
    })

  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId)
      let orders = await db.get.collection(collection.ORDER_COLLECTIONS).find({ userId: new objectID(userId) }).toArray()
      console.log(orders)
      resolve(orders)
    })

  }, getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db.get.collection(collection.ORDER_COLLECTIONS).aggregate([
        {
          $match: { _id: new objectID(orderId) }
        },
        {
          $unwind: '$products'

        }, {
          $project:
          {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        }, {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }




      ]).toArray()
      console.log(orderItems)
      resolve(orderItems)
    })
  },
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      console.log("Total*****" + total)
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId

      };
      console.log("Amount:", options.amount);
      console.log("Currency:", options.currency);
      console.log("Receipt:", options.receipt);

      instance.orders.create(options, function (err, order) {
        if (err) {
          console.error('Error creating Razorpay order:', err);
          // Handle the error appropriately
        } else {
          console.log('Razorpay order created successfully:', order);
          resolve(order);
          // Now you can use the order details for further processing or redirect to payment page
        }
      })

    })
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const { createHmac } = require('node:crypto');

      const secret = 'SxHg4MJiijy013g3jrCS2myv';
      let hash = createHmac('sha256', secret)
        .update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
        .digest('hex');
      if (hash == details['payment[razorpay_signature]']) {
        resolve()
      }
      else {
        reject()
      }
      console.log(hash);
      // Prints:
      //   c0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e
    })
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get.collection(collection.ORDER_COLLECTIONS).updateOne({ _id: new objectID(orderId) }, {
        $set: {
          status: 'placed'
        }
      }).then(() => {
        resolve()
      })
    })
  }
};
