require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const axios = require('axios');
// const cocktailSearchURL = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita`;
// const ingredientSearchURL = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=vodka`;
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');
const app = express();

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
// allows us to read form sent body data
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);
// app.use(helmet());
// Not good for doing during practice
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(session({
  secret: process.env.SESSION_SECRET, // should be an ENV variable
  resave: false,
  saveUninitialized: true
}));

// Init passport config MUST HAPPEN AFTER SESSION CONFIG
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Write custom middleware to access the user on every response
app.use((req, res, next) => {
  let alerts = req.flash();
  console.log(alerts);
  res.locals.alerts = alerts;
  res.locals.currentUser = req.user;
  next();
});

// ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/favorites', isLoggedIn, (req, res) => {
  res.render('favorites');
});

app.get('/search', (req, res) => {
  res.render('search')
});

// Get route for show
app.get('/show', (req, res) => {
  res.render('show')
});

// Route for searching by cocktail name
app.post('/search', (req, res) => {
  console.log('enter function');
  console.log(req.body.name);
  const cocktailName = req.body.name
  if (cocktailName) {
    const URL2 = `https://www.thecocktaildb.com/api/json/v1/1/search.php?`
    axios.get(`${URL2}s=${cocktailName}`)
      .then(response => {
        console.log('response');
        // console.log(response);
        let matchByCocktailName = response.data
        console.log(matchByCocktailName);
        res.render('show', { matchByCocktailName: matchByCocktailName })
      })
    const ingredientName = req.query.name
  } else if (ingredientName) {
    const URL = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?`
    axios.get(`${URL}i=${ingredientName}`)
      .then(response => {
        let matchByIngredient = response.data
        res.render('show', {
          matchByIngredient: matchByIngredient
        })
      })
  }
});

 // Route for searching by ingredient
 app.post('/search', (req, res) => {
 const ingredientName = req.query.name
 const URL = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?`
 axios.get(`${URL}i=${ingredientName}`)
 .then(response => {
   let matchByIngredient = response.data
  res.render('show', {
    matchByIngredient : matchByIngredient
  })
 })
 });



// post route 
app.post('/favorites', (req, res) => {
  console.log(req.body);
});


// axios.get(cocktailSearchURL)
//   .then(response => {
//     console.log(response.data);
//   }).catch(err => {
//     console.log(err);
//   });

app.use('/auth', require('./routes/auth'));

var server = app.listen(process.env.PORT || 3000, () => console.log(`🎧You're listening to the smooth sounds of port ${process.env.PORT || 3000}🎧`));

module.exports = server;