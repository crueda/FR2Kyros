var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session		=	require('express-session');

//var tracking = require('./routes/tracking');
var trackingWeb = require('./routes/trackingWeb');
var areaWeb = require('./routes/areaWeb');
var vertexWeb = require('./routes/vertexWeb');
var login = require('./routes/login');
var area = require('./routes/areas');
var vertex = require('./routes/vertex');
var tracking = require('./routes/tracking');



var app = express();

//configuración para ejs
app.set('views', path.join(__dirname, 'views'));
app.engine("html", require("ejs").renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//necesario para utilizar los verbos put y delete en formularios
var methodOverride = require('method-override');
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));
app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});



app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'apidoc')));


/*
var sess;

app.get('/',function(req,res){
	sess=req.session;
	if(sess.username)
	{
		res.redirect('/admin');
	}
	else{
	  res.render('indexLogin.html');
	}
});

app.post('/login',function(req,res){
	sess=req.session;
	sess.username=req.body.username;
	sess.password=req.body.password;
	//res.end('done');
	if (sess.password == "dat1234")
	{
		res.redirect('/');
	}
	else {
		req.session.destroy(function(err){});

		res.render("errorAPI",{
				title : "Kyros API REST",
				message : "Login error"
		});
	}
});

app.get('/admin',function(req,res){
	sess=req.session;
	if(sess.username)
	{
		//res.write('<h1>Hello '+sess.email+'</h1><br>');
		//res.end('<a href='+'/logout'+'>Logout</a>');
		res.redirect('/webkyrosapi');
	}
	else
	{
		res.write('<h1>Please login first.</h1>');
		res.end('<a href='+'/'+'>Login</a>');
	}

});

app.get('/logout',function(req,res){

	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		else
		{
			res.redirect('/');
		}
	});

});
*/


// Zona desmilitarizada
app.use('/kyrosapi', login);

app.use('/webkyrosapi', trackingWeb);
app.use('/webkyrosapi', areaWeb);
app.use('/webkyrosapi', vertexWeb);


// AUTENTICACION TOKEN
//app.all('/*', [require('./middlewares/validateRequest')]);

// Zona protegida
app.use('/kyrosapi', area);
app.use('/kyrosapi', vertex);
app.use('/kyrosapi', tracking);






// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
