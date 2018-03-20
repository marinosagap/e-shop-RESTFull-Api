//import { request } from 'https';

const express = require('express');
const router = express.Router(); //subpackage gia na kanoume diafora pragmata 
const Product = require('../models/product');//sto arxeio ayto dilwsame ton typo product pou apothikebetai sthn vash
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // xrhsimopoieitai gia na kanoume poio eykola extract plhrofories apo URL encoded h json file
const checkAuth = require('../middleware/check-auth');

const multer = require('multer'); //multer einai ena node js middleware gia uploading files
//ayto pou kanei einai na prosthetei sto body object ena file h files object
//oti stelnetai sto response einai sto body tou response
//to /products bgainei apo to app.js sto app.use
const storage =  multer.diskStorage({ //auto to kanw gia na kanw kalytera define pws apothikebontai oi fwto
    destination:function(req,file,cb){
        cb(null,"./uploads/");
    },
    filename:function(req,file,cb){
        cb(null,new Date().toISOString()+"_" + file.originalname) //etsi ftiaxnoume to onoma twn arxeiwn
    }
});
////genika opote xrhsimopoiw multer gia eikones me postman prepei na anoigw neo tab gt to multer doulebei me cookies
const fileFilter = (req,file,cb)=>{//to cb einai kai next
    console.log("file == "+JSON.stringify(file.mimetype) );
    console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF\n");
    if(file.mimetype=== 'image/jpeg' ||file.mimetype=== 'image/png' ||file.mimetype=== 'image/jpg'   )
    {
        cb(null,true); //accept file
    }
    else//an to arxeio den einai anamenomenou typou to agnow
    {
        cb(new Error('message'),false); //ignore file reject it

    }
    

}
const upload = multer(
    {
        
        filter:fileFilter,
        storage:storage ,
        limits:{
            fileSize:1024*1024*50 //kanw specify to posa megabyte tha einai h eikona
        }
}); //etsi kanoume specify ton fakelo pou to multer tha apothikeyei incoming files 

router.get('/' ,checkAuth, (req,res,next) =>{
    // res.status(200).json({
    //     message: "Handling GET requests to /products "
    // });
    Product.find() //etsi ta psaxnei ola
    .select("name price _id productImage" ) //gia na kanw define ti fields thelw na parw na kanw fetch kai tpt allo
    .exec()
    .then(docs=>{
        console.log("Products returned : \n" +docs); //ektypwnoume ola ta docs
        const response = {
            count: docs.length,
            products: docs.map(doc=> {  //me to .map sthn ousia leme gia kathe antikeimeno tou array docs efarmose thn function
                return {
                    name:doc.name,
                    price:doc.price,
                    productImage:doc.productImage,
                    _id : doc._id,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/products/' +doc._id
                    }
                }
            })
        };
        return res.status(200).json(response);
        // if(docs.length>0)
        // {
        //     res.status(200).json(docs);
        // }
        // else {
        //     res.status(404).json({ message: "No entries found"});
        // }
    })
    .catch(err=>{
        console.log("error on searching for all Products "+err);
        res.status(500).json({error:err });
    });

}); //to /product to pairnei apo to app.js 

//upload.single() einai handler gia ena file
//xrhsimopoiw multer gia apothikeysh arxeiwn
router.post('/' ,checkAuth,upload.single('productImage'), (req,res,next) =>{
    //const product = {};
    //  const product = { //new javascript objectme name kai price mesa apo to request
    //     name: req.body.name,
    //     price : req.body.price

    // };
    console.log(req.file);
    const product = new Product({//ayto to object twra mporw etsi opws einai na to perasw sthn vash
        _id: new mongoose.Types.ObjectId(), //etsi tha mas dwsei ena monadiko objectid
        name:req.body.name,
        price: req.body.price,
        productImage:req.file.path
    });//xrhsimopoioume to model Product gia na ftiaksoume neo tetoio antikeimeno
    console.log("product : "+JSON.stringify(product));
    product
    .save()
    .then(result=>{
        console.log(result);//ektypwnoume to result 
        //kai kanoume catch ena error an ginei 
        res.status(201).json({ //epistrefw san response json me to product pou eginei add
            message: "Handling POST requests to /products (created products successfully) ",
            createdProduct : {
                name:result.name,
                price:result.price,
                _id:result._id,
                request:{
                   type: 'GET',
                   url:"http://localhost:3000/products/"+result._id

                }
            }
        });
    }).catch(err=> {
        console.log(err)
        res.status(500).json({
            error:err
        });
    });//gia na kanei save to product sthn vash
   
    console.log("product == ",JSON.stringify(product));
    

}); 

//gia requests gia ena mono sygkekrimeno product

router.get('/:productId',checkAuth,(req,res,next)=>{
     const id = req.params.productId;//apo tis metablhtes tou request pairnoume thn productId
    // if(id == 'special'){
    //     res.status(200).json({
    //         message : 'You discovered a special ID (get request)',
    //         ID : id
    //     });
    // }
    // else {
    //     res.status(200).json({ //edw mpainoume sto else gia ena product 
    //         message:'You passed an ID (get request)'
    //     });
    // }
    

    //here we search for the id in the mongoose database
    Product.findById(id) //etsi kanoume to search statika 
    .select("name price _id productImage") 
    .exec()//ayta ginontai ena ena dhladh to exec praxnei kai meta to then einai on success kai to catch se error
    .then(doc=>{
            
            if(doc != null){
                console.log("success on databse search "+JSON.stringify(doc) );
                res.status(200).json(doc);
            }
                else{console.log("NOt valid id");
                     res.status(404).json({message : 'NOT valid id'});
            }
    })
    .catch(err=>{
        console.log("error on database seach" + JSON.stringify( err) );
        res.status(500).json({
            error:err
        });
    });
});

router.patch('/:productId',checkAuth,(req,res,next)=>{ //patch einai gia na allaksoume data sthn vasi
    // res.status(200).json({
    //     message: 'Updated product'
    // });
    const updateOps = {}
    const id = request.params.productId;
    for (const ops of req.body){  //etsi ftiaxnoume ena object gia opoiadipote body dwsei gia allagh gt mporei na thelei na allaksei mono thn timh kai oxi to name
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id:id} ,{$set: updateOps } ) //kanoume update price kai name
    
    .exec()
    .then(result=>{
        console.log("paccth sucess" + result);
        res.status(200).json({
            message: "Product updated //patched",
            request:{
                type:'PATCH',
                 url:"http://localhost:3000/products/"+id
            }

        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    })
});
router.delete("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Product deleted',
          request: {
              type: 'POST',
              url: 'http://localhost:3000/products',
              body: { name: 'String', price: 'Number' }
          }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
