const Order=require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

exports.orders_get_all= (req,res,next)=>{ //etsi steinoume enan controller pou einai mia function pou ton kanoume require apo to allo 
    Order.find()
    .select('product quantity _id')
    .populate('productId','name')
    .exec()
    .then(result=>
    {
        res.status(200).json({
            count:result.length,
            orders:result.map(doc=>{
               return {
                   _id: doc._id,
                   productId : doc.productId,
                   quantity: doc.quantity,
                   request:{
                       type:"GET",
                       url:'http://localhost:3000/orders/'+doc._id
                   }
               }
            })
          
        });
    })
    .catch(err=>{
        res.status(500).json({error:err});
    })
}

exports.create_order = (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      });
      return order.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Order stored",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
}