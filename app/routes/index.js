var express = require('express');
var q = require('q');
var router = express.Router();
var app = require('../app.js');
var ArticleGetter = require('../public/javascripts/articlegetter.js');

/* GET home page. */
router.get('/random', function(req, res, next) {
	var articleGetter = new ArticleGetter();

	var p1 = (function() {

		var p2 = articleGetter.render();


		return p2;

	})().then(function() {
		console.log("444",articleGetter.imgUrl, articleGetter.randTitle,"444");

		res.render('index.hbs', {
			title: "WikiGuesser",
			randTitle: articleGetter.randTitle,
			pitcher: articleGetter.imgUrl
		});		
	});

	/* var promise = new Promise(function(resolve, reject) {
		articleGetter.render();
		resolve(articleGetter.imgUrl);
	});

	promise.then(function(){

		console.log("444",articleGetter.imgUrl, articleGetter.randTitle,"444");

		res.render('index.hbs', {
			title: "WikiGuesser",
			randTitle: articleGetter.randTitle,
			pitcher: articleGetter.imgUrl
		});
		
	}); 

	promise.catch(function(error) {
		console.log(error);
	});	*/

});

router.get('/test', function(req, res, next) {
	res.render('test.hbs');
});

module.exports = router;
