const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const port = process.env.PORT || 3000;

// middleWare
app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pd4yjec.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // create db
        const db = client.db('asset-verse-db');
        // create collectin
        const userCollection = db.collection('users');
        const assetCollection = db.collection('allAssets')
        const requestCollection = db.collection('assetRequest');
        const employeeAffiliationsCollection = db.collection('employeeAffiliations')
        const packagesCollection = db.collection('packages');

        // payment related apis
        app.post('/create-checkout-session', async (req, res) => {
            try {
                const { packageId, hrmail } = req.body;

                if (!packageId || !hrmail) {
                    return;
                }

                const pkg = await packagesCollection.findOne({
                    _id: new ObjectId(packageId),
                });

                if (!pkg) {
                    return;
                }

                const amount = pkg.price * 100;
                const session = await stripe.checkout.sessions.create({
                    // 
                    line_items: [
                        {
                            price_data: {
                                currency: 'usd',
                                unit_amount: amount,
                                product_data: {
                                    name: pkg.name,
                                },
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success`,
                    cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancel`,
                    metadata: {
                        email: hrmail,
                        packageId,
                    },
                });

                res.send({ url: session.url });

            } catch (error) {
                console.error("STRIPE ERROR 👉", error);
                res.status(500).send({ error: error.message });
            }
        });



        // users post method
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })
        // users get method
        app.get('/users', async (req, res) => {
            const query = {}
            const { email } = req.query;
            if (email) {
                query.email = email;
            }
            const cursor = userCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        // update method

        app.patch('/users/:id', async (req, res) => {
            const { id } = req.params;
            const { name, profileImage } = req.body;
            const user = await userCollection.findOne({ _id: new ObjectId(id) });
            if (!user) {
                return;
            }
            const updateData = {};
            if (user.role === "hr") {
                if (name) updateData.hrName = name;
                if (profileImage) updateData.companyLogo = profileImage;
            }
            if (user.role === "employee") {
                if (name) updateData.employeeName = name;
                if (profileImage) updateData.employeeLogo = profileImage;
            }
            const result = await userCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            res.send(result);
        });

        // get method for asset 
        app.get('/allAsset', async (req, res) => {
            const query = {};
            const { email } = req.query;
            if (email) {
                query.userEmail = email;
            }
            const option = { sort: { createAt: -1 } }
            const cursor = assetCollection.find(query, option);
            const result = await cursor.toArray();
            res.send(result);
        })
        // post method for asset fron hr
        app.post('/allAsset', async (req, res) => {
            const allAsset = req.body;
            const result = await assetCollection.insertOne(allAsset);
            res.send(result);
        })
        // put method for allasset
        app.put('/allAsset/:id', async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;
            const result = await assetCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            res.send(result);
        });


        // delete method for allassets
        app.delete('/allAsset/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await assetCollection.deleteOne(query);
            res.send(result);
        })
        // update method 
        app.put('/allAsset/:id', async (req, res) => {
            const { id } = req.params
            const data = req.body

            const filter = { _id: new ObjectId(id) }
            const update = {
                $set: data
            }
            const result = await assetCollection.updateOne(filter, update)
            res.send(result)
        })

        // 

        // post method for assetRequest
        app.post('/assetRequest', async (req, res) => {
            const data = req.body;
            data.requestDate = new Date();

            const result = await requestCollection.insertOne(data);
            res.send(result);
        })
        // get method for asssetRequest
        app.get('/assetRequest', async (req, res) => {
            const query = {};
            const { email } = req.query;
            if (email) {
                query.requesterEmail = email;
            }
            const option = { sort: { createAt: -1 } }
            const cursor = requestCollection.find(query, option);
            const result = await cursor.toArray();
            res.send(result);
        })
        // put api for assetRequest
        app.put('/assetRequest/:id', async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;
            const result = await requestCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            res.send(result);
        });

        // get method for affiliations
        app.get('/employeeAffiliations', async (req, res) => {
            const query = {};
            const { hrEmail } = req.query;
            if (hrEmail) {
                query.hrEmail = hrEmail;
            }
            const result = await employeeAffiliationsCollection.find(query).toArray();
            res.send(result);
        })

        // post method for affiliations
        app.post('/employeeAffiliations', async (req, res) => {
            const affiliation = req.body;
            affiliation.affiliationDate = new Date();
            affiliation.status = affiliation.status || 'active';
            const result = await employeeAffiliationsCollection.insertOne(affiliation);
            res.send(result);
        });

        // method for delete affiliations 
        app.delete("/employeeAffiliations/:id", async (req, res) => {
            const id = req.params.id;

            const result = await employeeAffiliationsCollection.deleteOne({
                _id: new ObjectId(id),
            });

            if (result.deletedCount === 1) {
                res.send({ success: true });
            } else {
                res.status(404).send({ message: "Not found" });
            }
        });


        // packages post method
        app.post('/packages', async (req, res) => {
            const packages = req.body;

            const result = await packagesCollection.insertMany(packages);
            res.send(result);
        });

        // get method packages
        // Get all packages
        app.get('/packages', async (req, res) => {
            try {
                const packages = await packagesCollection.find({}).toArray();
                res.send(packages);
            } catch (error) {
                console.error(error);

            }
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Server is working")
})

app.listen(port, () => {
    console.log(`app is listening ${port}`);

})