const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const app = express();
dotenv.config();

// const key_id = process.env.KEY_ID
// const key_secret = process.env.KEY_SECRET

const port = process.env.PORT;

const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

// using Middleware
app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// View Engine Setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.send("Hello, we are working with razorpay");
});

app.get('/payments', (req, res) => {
    res.render('payment', { key: process.env.KEY_ID });
});

app.post('/api/payment/order', (req, res) => {

    params = req.body;
    // var options = {
    //     amount: req.body.amount,  // amount in the smallest currency unit
    //     currency: "INR",
    //     receipt: "rcp1"
    // };
    instance.orders.create(params)
        .then((data) => {
            res.send({ sub: data, status: "success" });
        })
        .catch((error) => {
            res.send({ sub: error, status: "failure" });
        })
});

app.post("/api/payment/verify", (req, res) => {

    let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

    let expectedSignature = crypto
        .createHmac('sha256', process.env.KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    console.log("sig", req.body.razorpay_signature);
    console.log("sig", expectedSignature);
    let response = { status: "failure" }
    if (expectedSignature === req.body.razorpay_signature)
        response = { status: "true" }
    res.send(response);
});


app.listen(process.env.PORT, (error) => {
    if (error) throw error
    console.log(`Server is listening on port: ${port}`);
});
