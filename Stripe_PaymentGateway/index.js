const express = require('express')
const bodyparser = require('body-parser')
const path = require('path')
const dotenv = require('dotenv')

const app = express()
dotenv.config();

const Publishable_Key = process.env.PUBLISHABLE_KEY
const Secret_Key = process.env.SECRET_KEY

const stripe = require('stripe')(Secret_Key)

const port = process.env.PORT;

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

// View Engine Setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('Home', {
        key: Publishable_Key
    })
})

app.post('/payment', (req, res) => {

    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Akhand Singh',
        address: {
            line1: 'Hind Nagar',
            postal_code: '262002',
            city: 'Lucknow',
            state: 'Uttar Pradesh',
            country: 'India',
        }
    })
        .then((customer) => {
            return stripe.paymentIntent.create({
                amount: 1000,
                description: 'Web Development Product',
                currency: 'INR',
                customer: customer.id
            })
        })
        .then((success) => {
            res.status(200).json({ message: 'Result Success', success })
        })
        .catch((err) => {
            res.send(err)
        });
})

app.listen(process.env.PORT, (error) => {
    if (error) throw error
    console.log(`Server is running on port: ${port}`);
})
