var express = require("express");
var app = express();
var passport = require("passport");
var GithubStrategy = require("passport-github").Strategy;
require("dotenv").config();
process.env.clientID;
process.env.clientSecret;

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: "http://localhost:8080/oauth-callback",
    },
    function (accessToken, refreshToken, profile, done) {
      //profile returned from Github
      return done(null, profile);
    }
  )
);

//express and passport
var session = require("express-session");
// app.use(session({ secret: "enter custom secret" }));
app.use(
  session({
    secret: "custom secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  //placeholder for custom user serilization
  //null for errors

  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.get(
  "/oauth-callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get("/", function (req, res) {
  var html =
    "<ul>\
    <li><a href='/oauth-callback'>GitHub</a></li>\
    <li><a href='/logout'>logout</a></li>\
    </ul>";

  if (req.isAuthenticated()) {
    html += "<p>authenticated as user:</p>";
    html += "<pre>" + JSON.stringify(req.user, null, 4) + "</pre>";
  }

  res.send(html);
});

app.get("/logout", function (req, res) {
  console.log("logging out");
  req.logout();
  res.redirect("/");
});

//simple route middleware to ensure that user is authenicated

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

app.get("protected", ensureAuthenticated, function (req, res) {
  res.send("access granted");
});

var server = app.listen(8080, function () {
  console.log(
    "Example app listening",
    server.address().address,
    server.address().port
  );
});
