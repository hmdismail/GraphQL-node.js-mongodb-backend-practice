const graphql = require('graphql');
const _ = require('lodash');

//author and book collection in mongodb
const Book = require('../models/book');
const Author = require('../models/author');


//dummy data with 3 book object and author object
/*
var books = [
    {name : 'Goosebumps', genre:'Horror', id:'1', authorid: '1'},
    {name : 'The Eagle', genre:'Biography', id:'2', authorid: '2'},
    {name : '7 habits of successful people', genre:'Inspirational', id:'3', authorid: '3'},
    {name : 'Life of Pi', genre:'Fantasy', id:'4', authorid: '2'},
    {name : 'Nurul Hoque', genre:'Biography', id:'5', authorid: '2'},
    {name : 'War Dogs', genre:'Inspirational', id:'6', authorid: '3'}
];

var authors = [
    {name : 'Patrick', age:'21', id:'1'},
    {name : 'Charline', age:'21', id:'2'},
    {name : 'Ismail', age:'26', id:'3'}
];
*/
//will have 2 object types : book and author

//need to define the object type

const{GraphQLObjectType,
     GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    //need to have a list as booktype is only a single book
    GraphQLList,
    GraphQLNonNull} = graphql; //properties from graphql package

//define the first object type

const BookType = new GraphQLObjectType({
    name : 'Book',
    //wrapping the fields in a function one type might not necessarily know what another type is
    //so that when we have multiple types this wont cause reference errors
    fields: () => ({
        id : {type: GraphQLID},
        name : {type : GraphQLString},
        genre : {type : GraphQLString},
        // definining type relation
        author : {
            type: AuthorType,
            resolve(parent,args){
                //console.log(parent);
                //return _.find(authors, {id: parent.authorid});
                return Author.findById(parent.authorid);
            }
            
        }
    })
});

// type relation : every book has an author, every author has a list of books, we need to translate that to our schema

const AuthorType = new GraphQLObjectType({
    name : 'Author',
    fields: () => ({
        id : {type: GraphQLID},
        name : {type : GraphQLString},
        age : {type : GraphQLInt}, //when we have dependencies from one type to another graphql may not recognise those dependencies
        books : {
            type : new GraphQLList(BookType),
            resolve(parent,args){
                //return _.filter(books, {authorid: parent.id});
                return Book.find({authorid: parent.id});
            }
        }
    })
});


//define root query to jump to the graph



const RootQuery = new GraphQLObjectType({
    name : 'RootQueryType',
    fields : {
        book : { //name of query book
            type : BookType,
            args : {id : {type:GraphQLID}}, //want the user to pass the argument along the book query : id property
            resolve(parent,args){

                //code to get data from db/ other source
                // take the id and look at the array with dummy data using lodash
                //console.log(typeof(args.id));
                //return  _.find(books ,{id: args.id});
                return Book.findById(args.id);

            }
        },
        
        author : { //name of the query
            type: AuthorType,
            args : {id : {type:GraphQLID}},
            resolve(parent,args){
                //return _.find(authors, {id:args.id});
                return Author.findById(args.id);
            }
        },

        books : {
            type :  new GraphQLList (BookType),
            resolve(parent,args){
                //return books;
                return Book.find({});
            }
        },

        authors : {
            type :  new GraphQLList (AuthorType),
            resolve(parent,args){
                //return authors;
                return Author.find({});
            }
        }


            }
});

//
const Mutation = new GraphQLObjectType({
    name : 'Mutation',
    fields:{
        addAuthor: {
            type :AuthorType,
            args :{
                name: {type: new GraphQLNonNull (GraphQLString)},
                age : {type : new GraphQLNonNull  (GraphQLInt)}
            },
            resolve(parent,args){
                let author = new Author({
                    name : args.name,
                    age : args.age
                });
                //mongoose connecting to our database, when we create a new instance of a datatype we have access to properties of datatype
                //author.save();
                return author.save();
            }
        },
        
        addBook: {
            type: BookType,
            args :{
                name : {type : new GraphQLNonNull (GraphQLString)},
                genre : {type : new GraphQLNonNull (GraphQLString)},
                authorid : {type : new GraphQLNonNull (GraphQLID)}
            },
            resolve(parent,args){
                let book = new Book({
                    name : args.name,
                    genre : args.genre,
                    authorid : args.authorid
                });
                return book.save();
            }
        } 
    }   
})

//explore this schema so we can use it as a property in app.js

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});