var express = require('express');
var router = express.Router();
var app = require('../app.js');
var ArticleGetter = require('../public/javascripts/articlegetter.js');

var articleGetter = new ArticleGetter();

articleGetter.render();

/* GET home page. */
router.get('/random', function(req, res, next) {
	res.render('index.hbs', {
		title: "WikiGuesser",
		randTitle: articleGetter.randTitle,
		pitcher: articleGetter.imgUrl
	});
});

router.get('/test', function(req, res, next) {
	res.render('test.hbs');
});

module.exports = router;
