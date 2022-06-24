require("dotenv").config();
  const express = require("express");
  const path = require("path");
  const mongoose = require("mongoose");
  const session = require("express-session");
  const MongoDBStore = require("connect-mongo");
  const flash = require("connect-flash");
  const AppError = require("./controlError/AppError");
  const cors=require("cors");
  

  // const jwt = require('express-jwt');





  const methodOverride = require("method-override");
  const passport = require("passport");
  const LocalStrategy = require("passport-local");
  const User = require("./models/user");
  const Users = require("./routes/user");
  const Detail= require("./routes/detail");

  //editing part..

const PDFDocument = require('pdfkit');
const fs = require('fs');
const doc = new PDFDocument();

  // const uri = process.env.DB_URL
  const uri ="mongodb+srv://Balajee:J3IwOazuLn6lBghe@cluster0.rfqls.mongodb.net/FORUSER?retryWrites=true&w=majority";
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log("connection open");
      
    })
    .catch((err) => {
      console.log(err);
    });
  
  const app = express();
  
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(express.static(__dirname + "/public"));
  
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride("_method"));
//   app.use(express.static(path.join(__dirname, "public")));
  
  const store = new MongoDBStore({
    mongoUrl:uri,
    secret: "thisshouldbeabettersecret!",
    touchAfter: 60
  });
  
  store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
  });
  
  const sessionConfig = {
    store,
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true, 
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  };
  
  app.use(session(sessionConfig));
  app.use(flash());
app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, User.authenticate()));
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });  
  app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();   
  });
  //routes part.
  app.use("/", Users);
  app.use("/detail", Detail);
  
  const handleValidationErr = (err) => {
    return new AppError("please fill up all the required field carefully", 400);
  };
  
  app.use((err, req, res, next) => {
    if (err.name === "ValidationError") err = handleValidationErr(err);
    next(err);
  });
  
  app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    console.log(err);
    if (err) {
      res.status(statusCode).render("error", { err });
    }
  });
  

  app.get('*', (req, res) => {
    res.render("home",{
      user:req.user
    }); 
      
  });


  doc.pipe(fs.createWriteStream('output.pdf'));
doc
  .fontSize(25)
  .text('Some text with an embedded font!', 100, 100);
  

  doc.image('public/image/flower.jpg', {
    fit: [300, 700],
    align: 'center',
    valign: 'center'
  });
  doc
  .addPage()
  .fontSize(25)
  .text('Here is some vector graphics...', 100, 100);

// Draw a triangle
doc
  .save()
  .moveTo(100, 150)
  .lineTo(100, 250)
  .lineTo(200, 250)
  .fill('#FF3300');

// Apply some transforms and render an SVG path with the 'even-odd' fill rule
doc
  .scale(0.6)
  .translate(470, -380)
  .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
  .fill('red', 'even-odd')
  .restore();

// Add some text with annotations
doc
  .addPage()
  .fillColor('blue')
  .text('Here is a link!', 100, 100)
  .underline(100, 100, 160, 27, { color: '#0000FF' })
  .link(100, 100, 160, 27, 'http://google.com/');


  doc.end();
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log("APP IS LISTENING ON PORT");
  });
  
//   {
//     "compilerOptions": {
//         "experimentalDecorators": true,
//         "allowJs": true
//     }
// }
// CLIENT_URL=http//localhost:3000/