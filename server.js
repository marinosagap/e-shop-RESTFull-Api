const http = require('http');
const app= require('./app');//opou to app proerxetai apo to arxeio app.js
const port = process.env.PORT || 3000;//etsi pairnei port apo ena environment variable tou process
const server = http.createServer(app);

server.listen(port);
console.log('Server running on port '+port);
