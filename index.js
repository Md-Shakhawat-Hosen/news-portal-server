const express = require('express')
const app = express();
const cors = require('cors')

require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.port || 5000;

//middleware

app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://newspaper-a-12-client.web.app",
      "https://newspaper-a-12-client.firebaseapp.com",
    ],
    credentials: true,
  })
);



app.get('/',(req,res)=>{
    res.send('newspaper server is running');
})






const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS_KEY}@cluster0.c3eejtp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const addArticlesCollection = client.db('newspaperDB').collection('addedArticles')
     const usersCollection = client.db("newspaperDB").collection('users')
     const publisherCollection = client.db("newspaperDB").collection('publishers')

    app.post('/users', async(req,res)=>{
      const singleUser = req.body;
      // console.log(singleUser)
      const result = await usersCollection.insertOne(singleUser);
      res.send(result);
    })

    app.post('/addArticles', async(req,res)=>{
         const oneArticle = req.body;
         const result = await addArticlesCollection.insertOne(oneArticle)
         res.send(result)
    })

    app.get('/addArticles', async(req,res)=>{
        const cursor = addArticlesCollection.find();
        const result = await cursor.toArray();
        res.send(result);


      // if (req.query?.limit && req.query?.offset) {
      //      const limit = parseInt(req.query.limit) || 10;
      //      const offset = parseInt(req.query.offset) || 0;
      //      console.log(limit);
      //      console.log(offset);
      //          const cursor = addArticlesCollection.find();
      //          const resultArray = await cursor.toArray();
      //          const paginatedArticles = resultArray.slice(
      //            offset,
      //            offset + limit
      //          );
      //          res.json(paginatedArticles);
      // }
      // else {
      //   const cursor = addArticlesCollection.find();
      //   const result = await cursor.toArray();
      //   res.send(result);
      // }
    })

    app.put('/addArticles/:id', async(req,res)=>{
      const id = req.params.id;
      const updatedArticles = req.body;

      // console.log(id)
      // console.log(updatedArticles);
      const filter = {_id: new ObjectId(id)}
      const options = {
        upsert: true
      }
      const myArticles = {
        $set: {
          ...updatedArticles
        }
      }
      const result = await addArticlesCollection.updateOne(filter,myArticles,options);

      res.send(result);
    })

    app.patch('/addArticles/:id', async(req,res)=>{
      const id = req.params.id;
      const user = req.body;
      // console.log(user);
      // console.log(id);

      const filter = { _id: new ObjectId(id) };
      // console.log(filter)

      if (user?.val == "approve") {
        const updateDoc = {
          $set: {
            status:"approved"
          },
        };
        const result = await addArticlesCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else if (user?.val == "premium") {
        const updateDoc = {
          $set: {
            isPremium: true
          },
        };
        const result = await addArticlesCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
      else if (user?.val == "decline"){
        const updateDoc = {
          $set: {
            isDecline: true,
            declineReason: user?.reason,
            status: "decline",
            isPremium: false,
          },
        };
        const result = await addArticlesCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
    })

    app.delete("/addArticles/:id", async(req,res)=>{
      const id = req.params.id;
      // console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = await addArticlesCollection.deleteOne(query);
      res.send(result);
    });


    app.get('/users',async(req,res)=>{
        // console.log(req.query.email);
        let query = {};
        if(req.query?.email){
            query={email:req.query.email}
        }

        const result = await usersCollection.find(query).toArray();
        res.send(result);
    })


    app.patch('/users', async(req,res)=>{
      const user = req.body;
      // console.log(user)

      if (user.isUpdate){
        const filter = { email: user.email };
        const updateDoc = {
          $set: {
            photo: user.photo,
            name: user.name,
          },
        };

        const result = await usersCollection.updateOne(filter,updateDoc);
        res.send(result)
      }
      else {
        const filter = {email:user.email}
        const updateDoc = {
          $set:{
            role: 'admin'
          }
        }
        const result = await usersCollection.updateOne(filter,updateDoc);
        res.send(result)
      }

     
    })


    app.post('/addPublisher', async(req,res)=>{
           const onePublisher = req.body;
          //  console.log(onePublisher)
           const result = await publisherCollection.insertOne(onePublisher);
           res.send(result);
    })


    app.get('/addPublisher', async(req,res)=>{
      const cursor = publisherCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, ()=>{
    console.log(`newspaper server is running on port: ${port}`)
})