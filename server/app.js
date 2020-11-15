const express  = require('express');
//const graphqlHTTP = require('express-graphql');

const { graphqlHTTP } = require('express-graphql');

const schema = require('./schema/schema');

const mongoose = require('mongoose');

// mongodb+srv://<username>:<password>@gql-ninja.3dar0.mongodb.net/<dbname>?retryWrites=true&w=majority


//app.use('/graphql'.graphqlHTTP()) //this function will fire up whenever a request to graphql data comes in to the express app

const app = express();

//middleware on a single route: this route will interact as endpoint with our graphql data
//this endpoint will be the we send all our graphql queries too

//connect to mlab database
mongoose.connect('mongodb+srv://hmdismail:test1234@gql-ninja.3dar0.mongodb.net/gql-ninja?retryWrites=true&w=majority', { useNewUrlParser: true }, { useUnifiedTopology: true } );
mongoose.connection.once('open', () => {
    console.log('connected to database');
});

app.use('/graphql', graphqlHTTP({
    //express graphql the package we installed as middleware needs to know how our graph looks, the datatypes and how it works, relations between the object types
    //schema:'',
    //can use the schema as a property here by importing schema.js
    schema,
    graphiql:true
}));

app.listen(4000,()=>{
    console.log("now listening for requests on port 4000");
});