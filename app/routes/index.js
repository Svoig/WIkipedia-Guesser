var express = require('express');
var router = express.Router();
var app = require('../app.js');
var ArticleGetter = require('../src/articlegetter.js');



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

		if (err === true && articleGetter.skip === true) {
			articleGetter.render();
		} else {
			console.log("err is ", err, " and articleGetter.skip is ", articleGetter.skip);
			res.render('error.hbs', {
			error: err
			});
		}


	});

	

});

router.get('/main', function(req, res, next) {
	res.render('main.hbs');
});


module.exports = router;
