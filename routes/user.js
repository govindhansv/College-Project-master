var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var UserHelper = require('../helpers/user-helpers');
var storeHelper = require('../helpers/store-helpers');

const userHelpers = require('../helpers/user-helpers');
const verifyLogin = (req, res, next) => {
  if (req.session.user)
    next()
  else
    res.redirect('/ulogin')
}

/* GET home page. */
router.get('/home', async function (req, res, next) {
    res.render('app/home');
});

router.get('/', verifyLogin, async function (req, res, next) {

  let stores = await storeHelper.getAllStores();
  
console.log(stores);
  let user = req.session.user
  console.log(user)
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }


  productHelper.getAllProducts().then((products) => {

    res.render('user/home', { products,stores, user, cartCount });
  })
});


router.get('/category/:category', async function (req, res, next) {

  let user = req.session.user
  console.log(user)
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }



  let category = req.params.category;
  console.log(user)


  productHelper.getCategoryProducts(category).then((products) => {

    res.render('user/view-products', { products, user, cartCount });
  })
});

router.get('/ulogin', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  }
  else {
    res.render('user/ulogin', { "loginErr": req.session.userLogginErr })
    req.session.userLoginErr = false
  }
})
router.get('/signup', (req, res) => {
  res.render('user/signup')

})

router.get('/profile', (req, res) => {
  res.render('user/profile',{user:req.session.user})
})

router.post('/signup', (req, res) => {
  console.log(req.body);


  UserHelper.doSignup(req.body).then((response) => {
    console.log('post');
    
    req.session.user = response 
    req.session.user.loggedIn = true//check weather it comes here or inside if
    if (!response.signupstatus) {
      console.error('Error during signup:');
      res.status(500).send('Signup failed. Please try again later.');
    } else {
      console.log('User signed up successfully. Response:', response);
      res.redirect('/');
      // res.status(200).send('Signup successful!');
    }
  })


});
router.post('/ulogin', (req, res) => {
  UserHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      
      req.session.user = response.user
      req.session.user.loggedIn = true
      res.redirect('/') //calling an existing route
    }
    else {
      req.session.userLogginErr = true
      res.redirect('/ulogin')
    }
  })

})

router.get('/logout', (req, res) => {
  req.session.user=null
  req.session.owner=null
  res.redirect('/')
})
router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  console.log("products cart ");
  console.log(products);
  if (totalValue == 0) {
    res.render('user/cartempty', { products, user: req.session.user._id, totalValue })
  } else {
    res.render('user/cart', { products, user: req.session.user._id, totalValue })
  }

})
router.get('/add-to-cart/:id', (req, res) => {
  console.log("api call")
  userHelpers.addTocart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })

  })
})
router.post('/change-product-quantity/', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})
router.post('/remove-cart-product', (req, res, next) => {
  userHelpers.RemoveItembtn(req.body).then((response) => {
    res.json(response)
  })
})
router.get('/order-success', (req, res) => {
  res.render('user/order-success')
})

router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user })
})
router.post('/place-order', async (req, res) => {
  console.log(req.body)
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    // res.json({ status: true, response })
    if (req.body['payment-method'] === 'Cash') {
      res.json({ codSuccess: true })
    }
    else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        console.log(response);
        res.json(response)

      })
    }

  })

})
router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user: req.session.user })
})


router.get('/orders', async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  console.log(orders);
  res.render('user/orders', { user: req.session.user, orders })
})

router.get('/view-order-products/:id', async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  console.log("products",products);
  res.render('user/view-order-products', { user: req.session.user, products })
})
router.post('/verify-payment', (req, res) => {
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("Payment successfull")
      res.json({ status: true })
    })

  }).catch((err) => {
    console.log(err)
    res.json({ status: false, errMsg: '' })
  })
})
module.exports = router;
