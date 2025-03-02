const express = require("express");
const db = require("MongoDb")("ourApp.db");//fix this 
db.pragma("journal_mode = WAL");
const app = express();



app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));//access user values by req.body
app.use(express.static("public"));

app.use(function(req, res, next){//middleware
    res.locals.errors = [];
    next();
})
app.get("/", (req, res)=>{
    res.render("homepage");
})
app.get("/login", (req, res)=>{
    res.render("login");
})

//when post request sent to this url
app.post("/register", (req, res)=>{
    //console.log(req.body);
    const errors = []

    if (typeof req.body.username !== "string") req.body.username = "";
    if (typeof req.body.password !== "string") req.body.password = "";

    req.body.username = req.body.username.trim()

    if(!req.body.username) errors.push("I need a username fam");
    if(req.body.username && req.body.username.length < 3) errors.push("username must be 3 characters duh");
    if(req.body.username && req.body.username.length > 10) errors.push("Too long genius");
    if(req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Letters numbers only fr");


    if(!req.body.password) errors.push("I need a password fam");
    if(req.body.password && req.body.password.length < 8) errors.push("password must be at least 8 characters duh");
    if(req.body.password && req.body.password.length > 25) errors.push("Too long genius(no more than )");

    if(errors.length) {
        return res.render("homepage", {errors})
    };
    
    //if error free, save new user into data base



    //log user in by giving them cookie to show unique homepage


    //https://www.reddit.com/r/Reformed/comments/yzp919/martin_luther_removed_7_books_from_the_bible_and/

})

app.listen(3000);