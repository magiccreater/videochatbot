var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;
var server = require('http'),
    url = require('url'),
    path = require('path'),
    formidable = require('formidable');

    

// Get interview model
var Interview = require('../models/interview');



/*
 * GET all interviews
 */
/*router.get('/', function (req, res) {


    Product.find(function (err, products) {
        if (err)
            console.log(err);

        res.render('all_products', {
            title: 'All products',
            products: products
        });
    });

});*/

/*
 * Save video in a file
 */
router.post('/savevideo', function (req, res) {
    
    
  var buf = new Buffer(req.body.blob, 'base64'); // decode
  var id = req.body.id;
  var AWS = require('aws-sdk');
  var fs =  require('fs');
  AWS.config.update( {accessKeyId: 'AKIAJVZZ37JXOVCYOXYQ', secretAccessKey: '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'} );  
  var s3 = new AWS.S3();
  
  // Bucket names must be unique across all S3 users
  
  var myBucket = 'virtualinterviewroom';
  
  var myKey = id+'.vtt';
  var subTitleData = req.body.subText;             

         params = {Bucket: myBucket, Key: myKey, Body: subTitleData };
         s3.putObject(params, function(err, data) {
  
           if (err) {
  
               console.log(err)
  
           } else {
  
               console.log("Successfully uploaded data to myBucket/myKey");
  
           }
  
        });
  


  var myKey_video = id+'.webm';
             

         params = {Bucket: myBucket, Key: myKey_video, Body: buf };
         s3.putObject(params, function(err, data) {
  
            if(err) {
                console.log("err", err);
              } else {
                
                Interview.findById(id, function (err, p) {
                      if (err)
                          console.log(err);
                     
                      p.status = 'finish';
                      
                      p.save(function (err) {
                          if (err)
                              console.log(err);
          
                          //req.flash('success', 'Product edited!');
                          return res.json({'status': 'success'});
                      });
          
                  });
              }
  
        });
  
 
});
/*
 * GET interview details
 */
router.get('/:id', function (req, res) {

    var emailid = req.params.interview;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Interview.findById(req.params.id, function (err, interview) {
        res.render('interview', {
            title: 'Interview Page',
            emailid: interview.emailid,
            skypeid: interview.skypeid,
            id:interview._id,
            status:interview.status,
            p:interview,
            loggedIn: loggedIn
        });
    });

});

// Exports
module.exports = router;