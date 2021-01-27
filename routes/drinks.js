const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../models');


router.get('/', (req, res) => {
    db.cocktail.findAll()
        .then((drinks) => {
            res.render('./favorites')
        })
});

router.post('/', function(req, res) {
    db.cocktail.create({ name: req.body.name })
        .then((favorites) => {
            res.redirect('/');
            console.log(`${favorite.name} was added to favorites!`)
        }).catch((err) => {
            console.log(err)
        });
});

module.exports = router;