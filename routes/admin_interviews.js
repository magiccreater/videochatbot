var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var isAdmin = auth.isAdmin;

// Get Interview model
var Interview = require('../models/interview');

/*
 * GET interviews index
 */
router.get('/', isAdmin, function(req, res) {
  var count;

  Interview.count(function(err, c) {
    count = c;
  });

  Interview.find(function(err, interviews) {
    res.render('admin/interviews', {
      interviews: interviews,
      count: count
    });
  });
});

/*
 * GET add interview
 */
router.get('/add-interview', isAdmin, function(req, res) {

  var emailid = "";
  var skypeid = "";
  var cellnumber = "";
  var weblink = "";
  var skypelink = "";
  var status = "";


  res.render('admin/add_interview', {
    emailid: emailid,
    skypeid: skypeid,
    cellnumber: cellnumber,
    //weblink: weblink,
    //skypelink: skypelink,
    //status: status
  });



});

/*
 * POST add interview
 */
router.post('/add-interview', function(req, res) {


  req.checkBody('emailid', 'Email Id must have a value.').notEmpty();
  req.checkBody('emailid', 'Enter valid Email Id').isEmail();
  req.checkBody('skypeid', 'skype id must have a value.').notEmpty();
  req.checkBody('cellnumber', 'Cellnumber must have a value.').isDecimal();
  //req.checkBody('weblink', 'WebLink must have a value').notEmpty();
  //req.checkBody('skypelink', 'Skype must have a value').notEmpty();
  var token = crypto.randomBytes(64).toString('hex');


  var emailid = req.body.emailid;
  var skypeid = req.body.skypeid;
  var cellnumber = req.body.cellnumber;
  var weblink = "http://127.0.0.1:2368/interviews/" + token;
  //var skypelink = req.body.skypelink;
  var status = 'pending';
  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/add_interview', {
      errors: errors,
      emailid: emailid,
      skypeid: skypeid,
      cellnumber: cellnumber,
      //weblink: weblink,
      //skypelink: skypelink,
      //status: status
    });
  } else {
    Interview.findOne({
      emailid: emailid
    }, function(err, interview) {
      if (interview) {
        req.flash('danger', 'EmailId exists, choose another.');
        res.render('admin/add_interview', {
          emailid: emailid,
          skypeid: skypeid,
          cellnumber: cellnumber,
          //weblink: weblink,
          //skypelink: skypelink,
          //status: status
        });

      } else {

        var interview = new Interview({
          emailid: emailid,
          skypeid: skypeid,
          cellnumber: cellnumber,
          weblink: weblink,
          //skypelink: skypelink,
          status: status
        });

        interview.save(function(err, lastId) {
          if (err)
            return console.log(err);

          var weblink = "http://127.0.0.1:2368/interviews/" + lastId._id;
          /*
           * Email sending
           */
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: '<email id>',
              pass: '<password>'
            }
          });

          var mailOptions = {
            from: 'no-reply@virtualinterview.com',
            to: emailid,
            subject: 'Interview Invitation',
            html: 'Greetings from Interviewer<br>Please follow below link to get into virtual interview room.<br><a href="' + weblink + '"> Click Here</a><br>Please feel free to connect with me in case of any query.<br>All the Best!',
          };

          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          req.flash('success', 'Interview scheduled!');
          res.redirect('/admin/interviews');
        });
      }
    });
  }

});

/*
 * GET edit interview
 */
router.get('/edit-interview/:id', isAdmin, function(req, res) {

  var errors;

  if (req.session.errors)
    errors = req.session.errors;
  req.session.errors = null;



  Interview.findById(req.params.id, function(err, p) {
    if (err) {
      console.log(err);
      res.redirect('/admin/interviews');
    } else {

      res.render('admin/edit_interview', {
        emailid: p.emailid,
        skypeid: p.skypeid,
        cellnumber: p.cellnumber,
        weblink: p.weblink,
        skypelink: p.skypelink,
        id: p._id
      });


    }
  });



});

/*
 * POST edit interview
 */
router.post('/edit-interview/:id', function(req, res) {

  var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

  req.checkBody('emailid', 'Title must have a value.').notEmpty();
  req.checkBody('skypeid', 'Description must have a value.').notEmpty();
  req.checkBody('cellnumber', 'Price must have a value.').isDecimal();
  req.checkBody('weblink', 'You must upload an image').notEmpty();
  req.checkBody('skypelink', 'You must upload an image').notEmpty();

  var emailid = req.body.emailid;
  var skypeid = req.body.skypeid;
  var cellnumber = req.body.cellnumber;
  var weblink = req.body.weblink;
  var skypelink = req.body.skypelink;

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect('/admin/interviews/edit-interview/' + id);
  } else {
    Interview.findOne({
      emailid: emailid,
      _id: {
        '$ne': id
      }
    }, function(err, p) {
      if (err)
        console.log(err);

      if (p) {
        req.flash('danger', 'EmailId exists, choose another.');
        res.redirect('/admin/interviews/edit-interview/' + id);
      } else {
        Interview.findById(id, function(err, p) {
          if (err)
            console.log(err);

          p.emailid = emailid;
          p.skypeid = skypeid;
          p.cellnumber = cellnumber;
          p.weblink = weblink;
          p.skypelink = skypelink;


          p.save(function(err) {
            if (err)
              console.log(err);

            req.flash('success', 'Interview edited!');
            res.redirect('/admin/interviews/edit-interview/' + id);
          });

        });
      }
    });
  }

});


/*
 * GET delete interview
 */
router.get('/delete-interview/:id', isAdmin, function(req, res) {

  var id = req.params.id;

  Interview.findByIdAndRemove(id, function(err) {
    console.log(err);
  });

  req.flash('success', 'Interview deleted!');
  res.redirect('/admin/interviews');

});

// Exports
module.exports = router;