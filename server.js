var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
//  express 4.X 以上body-parser 才分离出来
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var multer = require('multer');
var IP = process.env.IP;
var PORT = process.env.PORT;

var routes = require('./routes/index');
var settings = require('./settings');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log',{flags:'a'});
var errorLog = fs.createWriteStream('error.log',{flags: 'a'});

var app = express();

//会话支持
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  })
}));

app.use(multer({
	dest: './public/images',
	rename: function(fieldname,filename){
		return filename;
	}
}))

app.set('IP', process.env.IP || "0.0.0.0");
app.set('port', process.env.PORT || 4000);


app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'jade');
app.use(flash());

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(logger({stream: accessLog}));

//express 4.x以上使用

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.bodyParser())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(err,req,res,next){
	var meta = '[' + new Date() + ']' + req.url + '\n';
	errorLog.Write(meta + err.stack + '\n');
	next();
});

routes(app);

// app.listen(app.get('IP'), app.get('port'), function() {
//   console.log('Express server listening on IP ' + app.get('IP') + 'port ' + app.get('port'));
// });
app.listen(PORT, IP || "0.0.0.0", function(){
  console.log("Wenda-wnmxd server listening at", IP + ":" + PORT);
});