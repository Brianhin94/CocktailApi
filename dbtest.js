const db = require("../models");

const db = require("./models");

db.user.findOrCreate({
    where: {
        id: requestAnimationFrame.user.id
    }
}).then(([user, created]) => {
    db.cocktail.findOrCreate({
        where: {
            name: req.body.name
        }
    }).then(([cocktail, created]) => {
        user.addCocktail(cocktail).then(relationInfo => {
            console.log(`${cocktail.name} added to ${user.name}`);
        })
    })
}).catch(error => {
    console.log(error)
});