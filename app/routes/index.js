var express = require('express');
var router = express.Router();
var ArticleGetter = require('../public/javascripts/articlegetter.js')

/* GET home page. */

function renderFirst(req, res, next) {
	var articleGetter = new ArticleGetter();
	var boundRender = articleGetter.render.bind(articleGetter);
	boundRender();
	console.log("Rendered...", !(!articleGetter));
	console.log(articleGetter.randTitle, articleGetter.imgUrl);

	//if (err) return next(err);

	next();
}

router.get('/', function(req, res, next) {
	console.log("Handling get /");

	
	renderFirst().then(res.render('index.hbs', { 
  			title: 'BOOSHTON'
  			/*randTitle: articleGetter.randTitle,
  	 		randImgUrl: articleGetter.imgUrl, */
  	  }));
	
});

module.exports = router;
