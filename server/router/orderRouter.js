const express = require('express')
const router = express.Router()
const { v4: uuidv4  } = require('uuid');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Order = require('../models/orderModel')
router.post('/placeorder',async(req,res)=>{
    
    const{token,subTotal,currentUser,cartItems} = req.body

    console.log(token, "token in order")
    console.log(subTotal, "subtotal");
    console.log(currentUser, "currentUser");
    console.log(cartItems, "cartItems")

    try {
        const customer = await stripe.customers.create({
            email: token.email,
           source:token.id
        })
        const payment = await stripe.paymentIntents.create({
            
            amount:subTotal*100,
            currency: 'inr',
            customer: customer.id,
            receipt_email:currentUser.email,
        },
        {
            idempotencyKey: uuidv4()
        })
        if (payment) {
            const newOrder = new Order({
              name: currentUser.name,
              email: currentUser.email,
              userid: currentUser._id,
              orderItems: cartItems,
              orderAmount: subTotal,
              shippingAddress: {
                street: token.card.address_line1,
                city: token.card.address_city,
                country: token.card.address_country,
                picode: token.card.address_zip,
              },
              transectionId: token.id,
            });
            newOrder.save();
            res.send("Payment Success");
          } 
        else{
            res.send("payment failed")
        }
    } catch (error) {
        res.status(400).json({
            message:"something went wrong",
            error: error.stack
        })
    }

})

    router.post('/getuserorder', async(req,res)=>{
        const name = req.body.name;
        
        try {
           const orders = await Order.find({name:name});
           res.status(200).send(orders) 
        } catch (error) {
           res.status(400).json({
            message:'something went wrong',
            error:error.stack
           }) 
        }
    })

    router.get('/alluserorder', async(req,res)=>{
        
        try {
           const orders = await Order.find({});
           res.status(200).send(orders) 
        } catch (error) {
           res.status(400).json({
            message:'something went wrong',
            error:error.stack
           }) 
        }
    })

    router.post("/deliverorder", async (req, res) => {
        const orderid = req.body.orderid;
        try {
          const order = await Order.findOne({ _id: orderid });
          order.isDeliverd = true;
          await order.save();
          res.status(200).send("Order deliverd success");
        } catch (error) {
          res.status(400).json({
            message: "Something Went Wront",
            error: error.stack,
          });
        }
      });

module.exports = router