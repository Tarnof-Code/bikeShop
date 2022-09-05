var express = require('express');
var router = express.Router();
var dataBike = [
  {name: 'BIKO45', url: "./images/bike-1.jpg", price: "679", mea:false},
  {name: 'ZOOK7', url: "./images/bike-2.jpg", price: "799", mea:false},
  {name: 'LIKO89', url: "./images/bike-3.jpg", price: "839", mea:false},
  {name: 'GEW08', url: "./images/bike-4.jpg", price: "1249", mea:false},
  {name: 'KIWIT', url: "./images/bike-5.jpg", price: "899", mea:false},
  {name: 'NASAY', url: "./images/bike-6.jpg", price: "1399", mea:false},
  {name: 'WESH', url: "./images/bike-2.jpg", price: "1000", mea:false},
  {name: 'asr', url: "./images/bike-1.jpg", price: "1860", mea:false}
]

// var dataCardBike = []

// var total = 0
let quantity = 1
let fees = quantity * 30
let totalFees = 0


/* GET home page. */
router.get('/', function(req, res, next) {
    let bikeMea = dataBike.sort((a,b) => (a.price - b.price))
    bikeMea[0].mea = true
    bikeMea[1].mea = true
    bikeMea[2].mea = true

  

    res.render('index', { dataBike: dataBike, bikeMea });
});




router.get("/shop", function(req, res) {
  
      if(!req.session.dataCardBike){
        req.session.dataCardBike = []
        } 

      let isExist = false;

      for(let i=0; i<req.session.dataCardBike.length; i++) {
          if(req.session.dataCardBike[i].name === req.query.name){
            req.session.dataCardBike[i].quantity++
            req.session.dataCardBike[i].fees += 30
            isExist = true
          }
        }
 
      if(!isExist) {
          req.session.dataCardBike.push({name: req.query.name, url: req.query.url, price: req.query.price, quantity: quantity, fees: fees })
          
        }

       
        
      
  
  
  res.render("shop", {dataCardBike : req.session.dataCardBike, totalFees: totalFees})
  
})

router.get("/deleteShop", function(req, res) {
  console.log(req.query);
  req.session.dataCardBike.splice(req.query.ligne,1)
  res.render("shop", {dataCardBike : req.session.dataCardBike})
  
})

router.post("/updateShop", function(req, res) {
  console.log(req.body);
  req.session.dataCardBike[req.body.position].quantity = req.body.quantity
  req.session.dataCardBike[req.body.position].fees = req.body.quantity * 30


  res.render("shop", {dataCardBike : req.session.dataCardBike, fees: fees, totalFees})
  
})

router.get('/success', function(req, res, next) {
  req.session.dataCardBike = [];
  res.render('success', {  });
});

router.get('/cancel', function(req, res, next) {
  res.render('index', {dataBike: dataBike });
});

const stripe = require('stripe')('sk_test_51KjfTZFGnVDoOT03FiLF3TPwlgeJg3fGJf8iFTkGDhnNODQO9irSnw3ND7hDjNSICzHsab2aSr9pK82Dz3lEprHb00TeyW4TB4')


  router.post('/create-checkout-session', async (req, res) => {

    let line_items = []
    let totalBasket = 0
    console.log(req.session.dataCardBike)
    for(i=0; i< req.session.dataCardBike.length;i++) {
      totalFees += req.session.dataCardBike[i].fees
      console.log(req.session.dataCardBike[i].price)
      totalBasket += req.session.dataCardBike[i].price * req.session.dataCardBike[i].quantity
          }
      
      if(totalBasket > 2000 && totalBasket < 4000){
        totalFees = totalFees / 2
      }

      if(totalBasket > 4000) {
        totalFees = 0
      }
    console.log("total basket" +totalBasket)
    console.log("totalFees" +totalFees)
    
    req.session.dataCardBike.push({name: "Frais de port",url:"",  price: totalFees, quantity: 1})
    

    for(let i =0; i<req.session.dataCardBike.length; i++) {
      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: req.session.dataCardBike[i].name,
          },
          unit_amount: req.session.dataCardBike[i].price*100,
        },
        quantity: req.session.dataCardBike[i].quantity,
      })
    }

    const session = await stripe.checkout.sessions.create({


      
      line_items: line_items,
      
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
  
    res.redirect(303, session.url);
  });
  




module.exports = router;
