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
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use((req, res, next) => {
  let alerts = req.flash();
  console.log(alerts);
  res.locals.alerts = alerts;
  res.locals.currentUser = req.user;
  next();
});

app.use(methodOverride('_method'));



app.get('/', (req, res) => {
  res.render('index');
});

app.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile');
});

app.get('/search', (req, res) => {
  res.render('search')
});


app.get('/show', (req, res) => {
  res.render('show')
});


app.get('/favorites', isLoggedIn, (req, res) => {
  req.user.getCocktails()
    .then(drinks => {
      res.render('favorites', { drinks: drinks })
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

app.delete('/favorites/:id', function (req, res) {
  console.log(req.user.id);
  db.cocktail.destroy({
    where: {
      id: req.body.id
    }
  }).then(() => {
    res.redirect('/favorites')
  })
});


app.use('/auth', require('./routes/auth'));

var server = app.listen(process.env.PORT || 3001, () => console.log(`🎧You're listening to the smooth sounds of port ${process.env.PORT || 3001}🎧`));

module.exports = server;