var express = require('express');
var router = express.Router();
var app = require('../app.js');
var ArticleGetter = require('../public/javascripts/articlegetter.js');



/* GET home page. */
router.get('/random', function(req, res, next) {
	console.log("Getting /random");
	const articleGetter = new ArticleGetter();

	articleGetter.randomPage()
	.then(articleGetter.randomImage)
	.then(function(data) {

		console.log("In /random, AG.imgUrl is... ", articleGetter.imgUrl);

		res.render('index.hbs', {
			title: "WikiGuesser",
			randTitle: articleGetter.randTitle,
			pitcher: articleGetter.imgUrl
		});
	})
	.catch(function(err) {
		res.render('error.hbs', {
		error: err
		});
	});

	

});

router.get('/test', function(req, res, next) {
	res.render('test.hbs');
});

module.exports = router;
