
const express = require("express")
const MongoClient = require("mongodb").MongoClient
   
const app = express()
const jsonParser = express.json()
 
const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/")
 
let dbClient
 
app.use(express.static(__dirname + "/public"))

mongoClient.connect(function(err, client){
    if(err) return console.log(err)
    dbClient = client
    app.locals.collection = client.db("phonesdb").collection("phones")
    app.listen(3000, function(){
        console.log("Server is listen to requests...")
    })
})

app.post("/api/phones", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400)
    if(req.body.purpose=='add'){
        const phoneCompany=req.body.company
        const phoneModel=req.body.model
        const phoneOS=req.body.OS
        const phoneProcessor=req.body.processor
        const phoneScreenResolution=req.body.screenResolution
        const phone = {company:phoneCompany, model:phoneModel, OS:phoneOS, processor:phoneProcessor, screenResolution:phoneScreenResolution}
        const collection = req.app.locals.collection
        collection.insertOne(phone, function(err, result){
                
            if(err) return console.log(err)
            
        })
    }
    else{
        const collection = req.app.locals.collection

        let filter = [
            {name:'company',value:req.body.company},
            {name:'model',value:req.body.model},
            {name:'OS',value:req.body.OS},
            {name:'processor',value:req.body.processor},
            {name:'screenResolution',value:req.body.screenResolution},
        ]

        filter = filter.filter(e=>e.value!=='')

        collection.find({}).toArray(function(err, phones){

            filter.map(e=>phones=phones.filter(a=>a[e.name]==e.value))

            if(err) return console.log(err)
            res.send(phones)
            
        })
    } 
})

process.on("SIGINT", () => {
    dbClient.close()
    process.exit()
})
