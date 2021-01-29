require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const axios = require('axios');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');
const db = require('./models');
const app = express();
const methodOverride = require('method-override');

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
// allows us to read form sent body data
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);

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

app.use(methodOverride('_method'));

// ROUTES ~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile');
});

app.get('/search', (req, res) => {
  res.render('search')
});

// Get route for show
app.get('/show', (req, res) => {
  res.render('show')
});

// GET AND POST ROUTE for favorites
app.get('/favorites', isLoggedIn, (req, res) => {
  req.user.getCocktails()
  .then(drinks => {
    res.render('favorites', {drinks : drinks})
  })
});

app.post('/favorites', isLoggedIn, (req, res) => {
  console.log(req);
  db.user.findOrCreate({
    where: {
        id: req.user.id
    }
  }).then(([user, created]) => {
      db.cocktail.findOrCreate({
          where: {
              name: req.body.name
          }
      }).then(([cocktail, created]) => {
          user.addCocktail(cocktail).then(relationInfo => {
              console.log(`${cocktail.name} added to ${user.name}`);
              res.redirect('/favorites')
          })
      })
  }).catch(error => {
    res.send(error)
      console.log(error)
  })
});

// Route for searching by cocktail name // combined route for searching by ingredient with an if else statement
app.post('/search', (req, res) => {
  console.log('enter function');
  console.log(req.body.name);
  const cocktailName = req.body.name
  if (cocktailName) {
    const URL2 = `https://www.thecocktaildb.com/api/json/v1/1/search.php?`
    axios.get(`${URL2}s=${cocktailName}`)
      .then(response => {
        console.log('response');
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

// Route for deleting a favorite from favorites page
app.delete('/favorites/:id', function (req, res) {
  console.log(req.user.id);
  db.cocktail.destroy({where: {
    id : req.body.id
  }}).then(() => {
    res.redirect('/favorites')
  })
});


app.use('/auth', require('./routes/auth'));

var server = app.listen(process.env.PORT || 3001, () => console.log(`🎧You're listening to the smooth sounds of port ${process.env.PORT || 3001}🎧`));

module.exports = server;