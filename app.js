const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/users");

///mongodb://node-shop:<PASSWORD>@nodeshop-shard-00-00-9kvxg.mongodb.net:27017,nodeshop-shard-00-01-9kvxg.mongodb.net:27017,nodeshop-shard-00-02-9kvxg.mongodb.net:27017/test?ssl=true&replicaSet=nodeshop-shard-0&authSource=admin

mongoose.connect(

  //create a MongoDB Atlas free account and a cluster to work with 
///mongodb://node-shop:<PASSWORD>@nodeshop-shard-00-00-9kvxg.mongodb.net:27017,nodeshop-shard-00-01-9kvxg.mongodb.net:27017,nodeshop-shard-00-02-9kvxg.mongodb.net:27017/test?ssl=true&replicaSet=nodeshop-shard-0&authSource=admin
{
    useMongoClient: true
  }
).then(result=>{
  console.log("mongoose connection ok");
}).catch(err=>{
  console.log("mongoose connection error");
  console.log(JSON.stringify(err) );
});
mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));//public folder 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes which should handle requests
//etsi kanoume forward ta requests
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/user",userRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
