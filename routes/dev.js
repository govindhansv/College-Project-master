var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', async function (req, res, next) {
    res.render('dev');
});

router.get('/design', async function (req, res, next) {
    res.render('design');
});

module.exports = router;
