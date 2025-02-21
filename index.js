
const express = require('express');
const app =express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.7i4ix.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {

  const db = client.db('task-manager');
  const usersCollections = db.collection('users');
  const taskCollections = db.collection('tasks');



    app.post("/users", async (req, res) => {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await usersCollections.findOne(query);
        if (existingUser) {
          return res.send({ message: "user already exists", insertedId: null });
        }
        const result = await usersCollections.insertOne(user);
        res.send(result);
      });

      //task related APi Start 
    app.post('/tasks', async(req,res) =>{
       const taskList = req.body;
       const result = await taskCollections.insertOne(taskList);
       res.send(result)
    })

    app.get("/tasks/:email", async(req,res)=>{
      const email = req.params.email;
      const query = {email: email};
      const result = await taskCollections.find(query).toArray();
      res.send(result)
    })


    app.get("/singletasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollections.findOne(query);
      res.send(result);
     });

     app.put('/taskUpdate/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedTask = req.body;
      const taskUpdateList = {
        $set:{
          title: updatedTask.title,
          description:updatedTask.description,
          category: updatedTask.category,
        }
      }
      const result = await taskCollections.updateOne(filter,taskUpdateList);
      res.send(result)
    })





     // delete assingment card
     app.delete("/deleteTasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await taskCollections.deleteOne(query);
      res.send(result);
    });

    app.put('/tasks/reorder', async (req, res) => {
      const { tasks, email } = req.body;
    
      try {
        // Create an array of promises for updating tasks
        const updatePromises = tasks.map((task) => {
          return taskCollections.updateOne(
            { _id: new ObjectId(task._id) }, // Convert _id to ObjectId
            { $set: { category: task.category } } // Use $set to update specific fields
          );
        });
    
        // Wait for all update promises to resolve
        await Promise.all(updatePromises);
    
        res.status(200).send({ message: 'Tasks reordered successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to reorder tasks' });
      }
    });



    






  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', async(req,res)=>{
    res.send('Task manager is Running')
})

app.listen(port, ()=>{
    console.log(`Task manager is running this port: ${port}`);
})