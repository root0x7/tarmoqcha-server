var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const socketIo = require('socket.io')
const { createProxyMiddleware } = require('http-proxy-middleware');
const { v4:uuidv4 } = require('uuid');
const cors = require('cors')
const http = require('http')
const proxy = require('./services/proxy')
const socket = require('./services/socket')

const activeTunnels = new Map();
const tunnelConnections = new Map();


var indexRouter = require('./routes/index');

var app = express();
const server = http.createServer(app)
const io = socketIo(server,{
  cors:{
    origin:"*",
    methods:['GET','POST']
  }
});

// socket(io,activeTunnels,tunnelConnections)

const socketInstance = new socket(io, activeTunnels, tunnelConnections);
const my_proxy = new proxy(activeTunnels,tunnelConnections)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use((req,res,next)=>my_proxy.handleRequest(req,res,next))

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
