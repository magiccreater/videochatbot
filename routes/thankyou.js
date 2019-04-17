var express = require('express');
var router = express.Router();



/*
 * GET /
 */
router.get('/', function (req, res) {
    
    res.render('thankyou', {
        status: "Thank you for your time. We will get back to you" 
    });
    
});

// Exports
module.exports = router;


