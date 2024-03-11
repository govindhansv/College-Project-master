var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');



const verifyLogin = (req, res, next) => {
  if (req.session.owner)
    next()
  else
    res.redirect('/owner/login')
}

/* GET users listing. */
router.get('/', verifyLogin,function(req, res, next) {
 let user = req.session.owner

 productHelper.getOwnerProducts(user._id).then((products)=>{
  console.log(products)
  res.render('owner/view-products',{owner:true,products,user});
 })
});



router.get('/login', (req, res) => {
  if (req.session.owner) {
    res.redirect('/owner')
  }
  else {
    res.render('owner/owner-login', { "loginErr": req.session.userLogginErr })
    req.session.userLoginErr = false
  }
})
router.get('/signup', (req, res) => {
  res.render('owner/owner-signup')

})

router.post('/signup', (req, res) => {
  console.log(req.body);


  userHelpers.doOwnerSignup(req.body).then((response) => {
    console.log('post');
    
    req.session.owner = response 
    // req.session.user = response 
    req.session.owner.loggedIn = true//check weather it comes here or inside if
    if (!response.signupstatus) {
      console.error('Error during signup:');
      res.status(500).send('Signup failed. Please try again later.');
    } else {
      console.log('User signed up successfully. Response:', response);
      res.status(200).send('Signup successful!');
    }
  })

});

router.post('/login', (req, res) => {
  userHelpers.doOwnerLogin(req.body).then((response) => {
    if (response.status) {
      
      req.session.owner = response.user
      console.log("req.session.owner");
      console.log(req.session.owner);

      req.session.owner.loggedIn = true
      res.redirect('/owner') //calling an existing route
    }
    else {
      req.session.userLogginErr = true
      res.redirect('/owner/login')
    }
  })

})



router.get('/add-product',function(req,res){
  
  res.render('owner/add-product')
  
});
router.post('/add-product',(req,res)=>{
  
  console.log(req.body)
  req.body.ownerId = req.session.owner._id
  console.log(req.files.image)
  productHelper.addproduct(req.body,(id)=>{
    let image=req.files.image
    image.mv('./public/product-image/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('owner/add-product')
      }
      else{
        console.log(err)
      }
    })
    
  })
})
router.get('/delete-product:id',(req,res)=>{
  let proId=req.params.id
  console.log(proId)
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/owner/')
  })

})

router.get('/edit-product/:id',async(req,res)=>{
  let product=await productHelper.getProductDetails(req.params.id)
  console.log(product)
  res.render('owner/edit-product',{product})
})
router.post('/edit-product/:id',(req,res)=>{
  productHelper.UpdateProduct(req.params.id,req.body).then(()=>{
    console.log(req.params)
    let id=req.params.id
    res.redirect('/owner')
    if(req.files.Image)
    {
      let image=req.files.Image
      
      // image.mv('./public/product-image/'+id+'.jpg')
      image.mv('./public/product-image/'+id+'.jpg',(err,done)=>{
        if (!err) {
          console.log(' no err');
          // res.render('owner/add-product')
        }
        else{
          console.log(err)
        }
      })

    }

  

  })
})


router.get('/all-orders', async (req, res) => {
  let orders = await userHelpers.getAllOrders()
  // let orders = await userHelpers.getAllOrders(req.session.user._id)
  console.log(orders);
  res.render('owner/orders', { user: req.session.owner, orders,owner:true })
})
router.get('/all-users', async (req, res) => {
  let users = await userHelpers.getAllUsers()
  // let orders = await userHelpers.getAllOrders(req.session.user._id)
  // console.log(orders);
  res.render('owner/users', { user: req.session.owner, users,owner:true })
})

router.get('/all-products', async (req, res) => {
  let user = req.session.owner

  productHelper.getAllProducts().then((products)=>{
   console.log(products)
   res.render('owner/view-products',{owner:true,products,user});
  })
})


module.exports = router;
