const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


//loogout den exoume dioti den leitourgoume me sessions
router.post('/signup',(req,res,next)=>{
	//new user creation
	User.find({email:req.body.email})
	.select("_id email password")
	.exec()
	.then(user=>{
		if(user.length>0){ //if user already exists
			console.log(user);
			return res.status(409).json({
				message:"Mail already exists"
			})//conflict

		}
		else{

			bcrypt.hash(req.body.password,10,(err,hash)=>{//ayto den ginetai decrypt
			if(err!=null){//error we cound not hash it 
				return res.status(500).json({
					error:err
				})
			}
			else{
				const user = new User({
					_id:new mongoose.Types.ObjectId(),
					email:req.body.email,
					//salting roundes
					password:hash// email:req.body.email, //etsi tha ta bazamai raw sthn vasi me security flaues

					// password:req.body.password
				});
				user.save()
				.then(result => {
					console.log(result)
					res.status(201).json({
						mesage:'User created',
						user:user
					})
				})
				.catch(error=>{
					console.log(error);
					res.status(500).json({
						error:error
					})
				});
			}
		});//pairname ton password hasarismeno me xrhsh salt pou prin to hash prostithete ston password random strings
		
		}
	})
	

	
	

});

router.post('/login',(req,res,next)=>{
	User.find({email:req.body.email})
	.exec()//pairnoume promise
	.then(user=>{
		if(user.length < 1)//no users
		{
			return res.status(401).json({
				message:"Auth failed"
			});
		}
		bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            "secret",
            {
                expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token
          });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/",(req,res,next)=>{//to get users
	User.find()
	.select("_id email password")//to select paei prin to exec
	.exec()
	.then(result=>{
		res.status(200).json({
			message:"Database users ",
			users: result
		})
	})
	.catch(err=>{
		res.status(500).json({
			error:err
		})
	})
})


router.delete("/:userId",(req,res,next)=>{
	User.remove({_id:req.params.userId})
	.then(result=>{
		res.status(200).json({
			message:"user deleted"
		})
	})
	.catch(err=>{
		console.log(err);
		res.status(500).json({error:err})
	});
});


module.exports = router;