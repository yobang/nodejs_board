var express  = require('express');
var app      = express();
var path     = require('path');
var mongoose = require('mongoose');
var session  = require('express-session');
var flash    = require('connect-flash');
var bodyParser     = require('body-parser');
var cookieParser   = require('cookie-parser');
var methodOverride = require('method-override');


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL ,
    mongoURLLabel = "";

    process.env.DATABASE_SERVICE_NAME = 'peopleDB'

//if (mongoURL == null && process.env.DATABASE_SERVICE_NAME ) {
  if (mongoURL == null && process.env.DATABASE_SERVICE_NAME ) {

  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase() ,
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'] ,
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'] ,
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'] ,
      mongoPassword = process.env[mongoServiceName + '_PASSWORD'] ,
      mongoUser = process.env[mongoServiceName + '_USER'] ;

      mongoServiceName = 'peopleDB';
      mongoHost =  'localhost';
      mongoPort = '27017';
      mongoDatabase =  'peopleDB';
      mongoPassword =  'testuser';
      mongoUser =  'testuser';


  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
    //console.log("mongoURL:"+mongoURL)
  }
}

var initDb = function(callback) {
  console.log("mongoURL:"+mongoURL)

  mongoose.connect(mongoURL);
  //mongoose.connect(process.env.MONGO_DB);
  var db = mongoose.connection;
  db.once("open",function () {
    console.log("DB connected!");
  });
  db.on("error",function (err) {
    console.log("DB ERROR :", err);
  });

  //if (mongoURL == null) return;

  //var mongodb = require('mongodb');
  //if (mongodb == null) return;
/*
  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }
*/
   // db = conn;
   // dbDetails.databaseName = db.databaseName;
   // dbDetails.url = mongoURLLabel;
   // dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
 // });
};

// database
//mongoose.connect('mongodb://localhost/peopleDB');

/*
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once("open",function () {
  console.log("DB connected!");
});
db.on("error",function (err) {
  console.log("DB ERROR :", err);
});
*/
// view engine
app.set("view engine", 'ejs');

// middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(flash());
app.use(session({secret:'MySecret'}));
app.use(countVisitors);

// passport
var passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', require('./routes/home'));
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));

// init DB

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});
// start server

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

/*
var port = process.env.PORT || 3000;
app.listen(port, function(){
  //console.log('Server On!');
  console.log("nodejs server running!! Linsten Port : "+port)
});
*/

function countVisitors(req,res,next){
  if(!req.cookies.count&&req.cookies['connect.sid']){
    res.cookie('count', "", { maxAge: 3600000, httpOnly: true });
    var now = new Date();
    var date = now.getFullYear() +"/"+ now.getMonth() +"/"+ now.getDate();
    if(date != req.cookies.countDate){
      res.cookie('countDate', date, { maxAge: 86400000, httpOnly: true });

      var Counter = require('./models/Counter');
      Counter.findOne({name:"vistors"}, function (err,counter) {
        if(err) return next();
        if(counter===null){
          Counter.create({name:"vistors",totalCount:1,todayCount:1,date:date});
        } else {
          counter.totalCount++;
          if(counter.date == date){
            counter.todayCount++;
          } else {
            counter.todayCount = 1;
            counter.date = date;
          }
          counter.save();
        }
      });
    }
  }
  return next();
}
