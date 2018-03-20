const express = require('express');
const router = express.Router(); //subpackage gia na kanoume diafora pragmata 
//to /orders den xreiazetai edw gt tha to vazw sto app.js
const mongoose =require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Order=require('../models/order');
const Product = require('../models/product');

const OrdersController =require('../controllers/orders');

router.get('/',checkAuth,OrdersController.orders_get_all);//opote erxete ena request paei ston controler

router.post("/", checkAuth, OrdersController.create_order);

router.get('/:orderId',checkAuth,(req,res,next)=>{
    // res.status(200).json({
    //     message : "Order details ",
    //     orderid:req.params.orderId
    // });
    Order.findById(req.params.orderId)
    .select('_id quantity productId')
    .populate('productId') //etsi tha emfanisei kai oles tis plhrofories gia to product ppou to productId anaferetai

    .exec()
    .then(order=>{
        if(!order){
            return res.status(404).json({
                message:"Order not found"
            })
        }
        res.status(200).json({
            order: order,//
            request:{
                type:"GET",
                url:"http://localhost:/3000/orders/"+req.params.orderId
            }
        })
    })
    .catch(err=>{
        res.status(500).json({error:err});
    });
}); 

router.post('/:orderID',checkAuth,(req,res,next)=>{
    res.status(200).json({
        message : "Order posted ",
        orderID:req.params.orderID
    });
}); 
router.delete('/:orderId',checkAuth,(req,res,next)=>{
    // res.status(200).json({
    //     message : "Order deleted ",
    //     orderID:req.params.orderID
    // });
    Order.remove({
        _id:req.params.orderId
    })
    .exec()
    .then(result=>{
        res.status(200).json({
            message: "Order deleted",
            request:{
                type:"POST",
                url:"http://localhost:3000/orders/",
                body:{productId:"ID" ,quantity:"Number"}
            }
        })
    })
    .catch(err=>{
        res.status(500).json({error:err});
    });
}); 


module.exports = router;//etsi to router object mporei na ginei import se alla arxeia