var express = require('express');
var router = express.Router();
var db = require('../config/connection')



/* GET home page. */
router.get('/health', async function (req, res, next) {
    res.status(200).send('Ok');
});

router.get('/db/clean', async function (req, res, next) {
    res.render('dev');
});

router.get('/db/add/products', async function (req, res, next) {
    let array = [
        {
            "name": "Carrots",
            "category": "vegetables",
            "price": 50,
            "quantity": 1,
            "owner": "6596cce6fd9c707875b312ed"
          },
          {
            "name": "Broccoli",
            "category": "vegetables",
            "price": 65,
            "quantity": 1,
            "owner": "6596cce6fd9c707875b312ed"
          },
          {
            "name": "Spinach",
            "category": "vegetables",
            "price": 96,
            "quantity": 1,
            "owner": "6596cce6fd9c707875b312ed"
          },            
          {
            "name": "Carrots",
            "category": "vegetables",
            "price": 50,
            "quantity": 1,
            "owner": "65f2ea75bf60cda29df213a9"
          },
          {
            "name": "Broccoli",
            "category": "vegetables",
            "price": 65,
            "quantity": 1,
            "owner": "65f2ea75bf60cda29df213a9"
          },
          {
            "name": "Spinach",
            "category": "vegetables",
            "price": 96,
            "quantity": 1,
            "owner": "65f2ea75bf60cda29df213a9"
          },
          {
            "name": "Carrots",
            "category": "vegetables",
            "price": 50,
            "quantity": 1,
            "owner": "65f2e33877ef3f162b9a19bc"
          },
          {
            "name": "Broccoli",
            "category": "vegetables",
            "price": 65,
            "quantity": 1,
            "owner": "65f2e33877ef3f162b9a19bc"
          },
          {
            "name": "Spinach",
            "category": "vegetables",
            "price": 96,
            "quantity": 1,
            "owner": "65f2e33877ef3f162b9a19bc"
          }    
    ]

    array.forEach(element => {
        db.get.collection('products').insertOne(element).then((obj)=>{
            console.log('added');
            console.log(obj);
        });
    });
});



router.get('/db/add/category', async function (req, res, next) {
    let array = [
            {
              "category": "Vegetables",
              "owner": "6596cce6fd9c707875b312ed"
            },
            {
              "category": "Vegetables",
              "owner": "65f2ea75bf60cda29df213a9"
            },
            {
              "category": "Vegetables",
              "owner": "65f2e33877ef3f162b9a19bc"
            }       
    ]

    array.forEach(element => {
        db.get.collection('category').insertOne(element).then((obj)=>{
            console.log('added');
            console.log(obj);
        });
    });
});

router.get('/design', async function (req, res, next) {
    res.render('design');
});

module.exports = router;
