
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
const dotenv = require('dotenv').config()
const jwt = require('jsonwebtoken')


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v48zzim.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true,useUnifiedTopology: true,serverApi: ServerApiVersion.v1,});

function veryfytoken(req, res, next){
    const token = req.headers.authtoken;
    if(!token){
       return res.status(401).send({message:'Unauthorize accese'})
    }
    jwt.verify(token.split(" ")[1], process.env.ACCESE_TOKEN,function(err, decoded){
        if(err){
           res.status(401).send({message:'Unauthorize accese'})
        }
        req.decoded = decoded
        next()
    });
}
async function run(){
    try{
        const dataCollection = client.db('carGarrage').collection('apiData');
        const cartCollection = client.db('carGarrage').collection('priceCart');
        const teamCollection = client.db('carGarrage').collection('teamData');
        const orderCollection = client.db('carGarrage').collection('orderList');

        app.get("/homebanner",async (req, res) => {
            const query = {};
            const result = await dataCollection.find(query).toArray()
            res.send(result)
            // console.log(result)
        });

        app.get("/priceCar",async (req, res) => {
            const result = await cartCollection.find({}).toArray()
            res.send(result)
            // console.log(result)
        });

        app.get("/servicedetails/:id",async (req, res) => {
          const id = parseInt(req.params.id);
          const query = {id:id}
          const result = await cartCollection.findOne(query)
          res.send(result)
        });


        app.get("/teamdata",async (req, res) => {
          const result = await teamCollection.find({}).toArray();
          res.send(result);
        });


        app.post('/addorder/', async(req, res)=>{
            const result = await orderCollection.insertOne(req.body)
            res.send(result)
        })

        app.get('/orderdetails/:email', veryfytoken, async (req, res)=>{
            if(req.decoded.email !== req.params.email){
                res.status(401).send({ message: "Unauthorize accese" });
            }
            const query = {email: req.params.email};
            const result = await orderCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/jwt',(req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESE_TOKEN, {expiresIn: '1h'});
            res.send({token})
        })

        app.delete('/ordersdelete/:id',async(req, res)=>{
            const ids = req.params.id
            const query = {_id: ObjectId(ids)}
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })
        
    }finally{

    }
}

run().catch(err => console.error(err.message))



app.get('/',(req, res)=>{
    res.send('Your site Running......')
})


app.listen(port,()=>{
    console.log(`Your site running on ${port}`)
})