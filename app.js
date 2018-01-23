const express = require('express');
const ejs = require('ejs');
const paypal =require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AfV2g8DHp4UuTLxwBkqYtOZDRwEQZmkLHOpnMELKXDbrbsa6_9uEaS8FefDhepp8-9SQAZxMj_n2zhPB',
    'client_secret': 'EFG2pixeDI1sPuYklLRyYNs3Gocq3zj1-JJlBJorXcZjTKxSjS8FvCbf8vy56KNO2thjL4zWuSMqcrvF'
});


const  app= express();

app.set('view engine', 'ejs');
app.get('/', (req, res) =>  res.render('index'));

app.post('/pay', (req,res) => {
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Global Club pass",
                    "sku": "001",
                    "price": "16.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "16.00"
            },
            "description": "Global club Entry pass"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i=0;i<payment.links.length; i++){
                if(payment.links[i].rel==='approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});


app.get('/success', (req,res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "16.00"
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.send('Successfully Completed transaction');
        }
    });
} );

app.get('/cancel', (req,res) => res.send('Cancelled'));
app.listen(3000, () => console.log('Server started'));


