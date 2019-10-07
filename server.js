var express = require("express");
var QR = require('qrcode');
const crypto = require('crypto');
var path = require('path');
var Razorpay = require("razorpay");
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var instance = new Razorpay({  key_id: 'rzp_test_AI3xzqhZKVYu2l',  key_secret: 'kq3SYmyaYJyGGwygKazFY8Ui'})
var app = express();
var amnt;
var secret = 'kq3SYmyaYJyGGwygKazFY8Ui';
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));

app.get('/', function(req,res){
   res.render('index');
})

app.get('/book', function(req,res){
   res.render('book');
});
app.post('/order', urlencodedParser, function(req,res){
   var amnt1 = req.body.amount * req.body.qty ;
   var gst = amnt1*0.18;
   amnt = amnt1 + gst; 
      var options = {
      amount: amnt,
      currency: "INR",
      receipt: req.body.itemId,
      notes : [req.body.itemDesc, req.body.dnt, req.body.venue, req.body.qty],
    };
    instance.orders.create(options, function(err, order) {
         res.render('pay',{
            orderId : order.id,
            amnt : order.amount/100,
            price : req.body.amount/100,
            qty : order.notes[3],
            tot_price : amnt1/100,
            sgst : gst/100,
            desc : order.notes[0],
            venue : order.notes[2],
            dnt : order.notes[1],
         });
    });
});

app.post('/success', urlencodedParser, function(req,res){
   var generated_signature = crypto.createHmac('sha256', secret).update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id).digest('hex');
   if (generated_signature == req.body.razorpay_signature) {
      console.log("Verified");
      instance.orders.fetch(req.body.razorpay_order_id, function(err, order) {
         res.render('success',{
            refid : req.body.razorpay_payment_id,
            price : order.amount/100,
            qty : order.notes[3],
            desc : order.notes[0],
            venue : order.notes[2],
            dnt : order.notes[1],
         });
    });   
   }
});

var server = app.listen(8081, function(){
   var port = server.address().port;
   console.log("Server started at http://localhost:%s", port);
});

