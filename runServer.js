const path = require('path')
const server = require('./server');
const port = 3000;
const express = require('express')
server.use(express.static('dist'))

server.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
  }
})