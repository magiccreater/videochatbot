var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');
var buffer = require('buffer');



//console.log(testDialog.sendTextMessageToDialogFlow("Hi Dear", "limpidcoder"));
// console.log(testDialog.createIntent(projectId, "Test", ["This is test Message"], ["THis is ans text"]));
//
// console.log(testDialog.listIntents(projectId));
// console.log(testDialog.deleteIntent(projectId, "6d609513-306c-4772-a037-f28150783e7b"));

// Connect to db
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Init app
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors variable
app.locals.errors = null;

// Get Page Model
var Page = require('./models/page');

// Get all pages to pass to header.ejs
/* Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
}); */

// Get Category Model
/* var Category = require('./models/category'); */

// Get all categories to pass to header.ejs
/* Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
}); */

// Express fileUpload middleware
app.use(fileUpload());

// Body Parser middleware
//


// Express Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
  //  cookie: { secure: true }
}));

app.use(bodyParser.json({
  limit: '100mb',
  extended: true
}))
app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: true
}))

// Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  },
  customValidators: {
    isImage: function(value, filename) {
      var extension = (path.extname(filename)).toLowerCase();
      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        case '':
          return '.jpg';
        default:
          return false;
      }
    }
  }
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Set routes
var pages = require('./routes/pages.js');
/* var products = require('./routes/products.js'); */
var interviews = require('./routes/interviews.js');
/* var cart = require('./routes/cart.js'); */
var users = require('./routes/users.js');
var thankyou = require('./routes/thankyou.js');
/* var adminPages = require('./routes/admin_pages.js'); */
/* var adminCategories = require('./routes/admin_categories.js'); */
/* var adminProducts = require('./routes/admin_products.js'); */
var adminInterviews = require('./routes/admin_interviews.js');
var adminQuestions = require('./routes/admin_questions.js');

app.use('/admin/interviews', adminInterviews);
/* app.use('/admin/pages', adminPages); */
/* app.use('/admin/categories', adminCategories); */
/* app.use('/admin/products', adminProducts); */
app.use('/thankyou', thankyou);
app.use('/interviews', interviews);
app.use('/admin/questions', adminQuestions);
/* app.use('/products', products);
app.use('/cart', cart); */
app.use('/users', users);
app.use('/', pages);

var socket = require('./config/sock');
socket.conn();
socket.fromClient();

// Start the server

var port = process.env.PORT || 2368;
app.listen(port, function() {
  console.log('Server started on port ' + port);
});