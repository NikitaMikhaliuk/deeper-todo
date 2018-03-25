var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.dev.config');
const server = require('./server');

const PORT = process.env.PORT || 5000;

var compiler = webpack(config);
server.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
server.use(webpackHotMiddleware(compiler));

const express = require('express')
server.use(express.static('dist'))

server.listen(PORT, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", PORT, PORT)
  }
})