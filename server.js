/*************************************************************************************
* WEB322 - 2231 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Meenakshi Sharma
* Student ID    : 166234211
* Course/Section: WEB322 ZBB
*
**************************************************************************************/

const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const rentalsList = require("./models/rentals-db");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");

dotenv.config({path:"./sendgrid.env"});
const app = express();

// Set up HandleBars
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main"
}));
app.set("view engine", ".hbs");

app.use(express.urlencoded({ extended: false }));


let userInfo={};



// Make the "assets" folder public.
app.use(express.static(path.join(__dirname, "/assets")));

// setup a 'route' to listen on the default url path (http://localhost)

app.get("/", function (req, res) {
    res.render("home");
});
app.get("/sign-up", function (req, res) {
    res.render("sign-up");
});

app.get("/log-in", function (req, res) {
    res.render("log-in");
});
app.get("/rentals", function (req, res) {
    res.render("rentals",{
        prov : rentalsList.getFeaturedRentals(),
        rentals : rentalsList.getRentalsByCityAndProvince()
    });
});

app.get("/welcome", function (req, res) {
  res.render("welcome", userInfo);
});


app.post("/sign-up", function (req, res) {

  
  let message = {};
  let fname = req.body.fname;
  let lname = req.body.lname;
  let email = req.body.email;
  let password = req.body.password;
  let checkSpaces = /^\s+$/;
  let emailValid = /^[0-9a-zA-Z_]+@[a-zA-Z_]+\.[a-zA-Z]+$/;
  //let passValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[*.!@$%^&(){}:<>.?~#]).{8,12}$/;
  if ( fname == "" ||checkSpaces.test(fname)|| fname == null ) {
    message.fnameMsg = "Please enter a valid first name";
  }
  if (lname == "" || lname == null || checkSpaces.test(lname) ) {
    message.lnameMsg = "Please enter a valid last name";
  }
  if (
    email == "" ||
    email == null ||
    checkSpaces.test(email || !emailValid.test(email))
  ) {
    message.emailMsg = "Please enter a valid email address";
  }
  if (
    password == "" || password == null || checkSpaces.test(password) 
   // || !passValid.test(password)
  )
   {
    message.passwordMsg =
      "Please enter a valid password with atleast 8 and maximum 12 characters, atleast one uppercase, one lowercase, one number and one special character";
  }
  if (
    message.fnameMsg || message.lnameMsg || message.emailMsg ||message.passwordMsg) {
    message.fname = fname;
    message.lname = lname;
    message.email = email;
    message.password = password;
    res.render("sign-up", message);
  } else {
  
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);//
    const msg = {
      to: email,
      from: "smeenakshi1008@outlook.com",
      subject: "Welcome to VacaySpot",
      text: `Hi Welcome to VacaySpot ${fname} ${lname}, We are glad to have you with us. 
      I am Meenakshi Sharma and the name of my website is VacaySpot`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Successfully email sent!!!");
      })
      .catch((error) => {
        console.error(error);
      });

    userInfo.email = email;
    res.redirect("/welcome");



  }

});

app.post("/log-in", function (req, res) {
    let message = {};
    let email = req.body.email;
    let password = req.body.password;
    let checkSpaces = /^\s+$/;
    const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/;
    if (email == "" || email == null || checkSpaces.test(email)) {
      message.emailMsg = "Please enter a valid email address";
    }
    if (password == "" || password == null || checkSpaces.test(password)) {
      message.passwordMsg = "Please enter your password";
    }
    if(!emailCheck.test(email)){
      message.emailMsg = "Please enter a valid email address";
    }
     if(!passwordCheck.test(password)){
      message.passwordMsg = "Password must be between 8 to 12 characters and contain at least one lowercase letter, uppercase letter, number and a symbol.";
    }
    if (message.emailMsg || message.passwordMsg) {
      message.email = email;
      message.password = password;
      res.render("log-in", message);
    } else {
      userInfo.email = email;
      res.redirect("/welcome");
  
    }
  });

// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);