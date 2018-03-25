const path = require('path')
const server = require('./server');
const PORT = process.env.PORT || 5000;
const express = require('express')
server.use(express.static('dist'))

server.listen(PORT, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s.", PORT, PORT)
  }
})