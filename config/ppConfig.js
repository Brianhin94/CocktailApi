// reqqsss
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../models');

// Passport will serialize objects; converts the user to an identifier (id)
passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

//pass port deserializing an object ; finds user in db via serialized identifier (id)
passport.deserializeUser((id, cb) => {
    db.user.findByPk(id).then(user => {
        cb(null, user);
    }).catch(err => {
        cb(err, null)
    });
})

// Passport using its strategy to provide local auth.

//config: an object of data to identifyt our auth fields

//callback function: a funct that is called to log the user in. we can pass the email and pass to a db query and return the appropriate info in the callback. (login(error, user){do some stuff})
    //provide "null" if no error or "false" if theres no user
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, cb) => {
// look for a user and cb accordingly
db.user.findOne({
    where: { email }
}).then(user => {
    // if there is no user or if pw invalid then cb(null, false) no error, false user
    if (user && user.validPassword(password)) {
        // no error, give the user
        cb(null, user);
    } else {
        // no error, false user
        cb(null, false);
    }
}).catch(cb)
    }));
    //export the config
    module.exports = passport;