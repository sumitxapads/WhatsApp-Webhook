const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config()
const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const token=process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

app.get('/', function (req, res) {
    res.send('Hello World')
  })


// Verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    
    if(mode && token){
        if(mode === "subscribe" && token === mytoken){
            res.status(200).send(challenge);
        }else{
            res.status(403);
        } 
    }
})

app.post("/webhook", (req, res) => {
    let body_param = req.body;

    console.log(JSON.stringify(body_param, null, 2));
    if(body_param.object){
        if(body_param.entry && body_param.entry[0].changes && body_param.entry[0].changes[0].value.messages && body_param.entry[0].changes[0].value.messages && body_param.entry[0].changes[0].value.messages[0]){
            let phone_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body_param.entry[0].changes[0].value.messages[0].from;
            let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

            axios({
                method: "POST",
                url: "https://graph.facebook.com/v18.0/"+phone_no_id+"/messages?access_token="+token,
                data: {
                        messaging_product: 'whatsapp',
                        to: process.env.TO,
                        type: "text",
                        text: {
                            "body": "Testing messages from Xapads"
                        }
                    },
                    Headers:{
                        "Content-Type": "application/json"
                    }    
            });
            res.sendStatus(200);
        }
    }

})
  
app.listen(process.env.PORT, () => {
    console.log("starting on 9000 port...");
});


// GET https://www.your-clever-domain-name.com/webhooks?
//   hub.mode=subscribe&
//   hub.challenge=1158201444&
//   hub.verify_token=meatyhamhock

// app.use(function (req, res) {
//   res.setHeader('Content-Type', 'text/plain')
//   res.write('you posted:\n')
//   res.end(JSON.stringify(req.body, null, 2))
// })
