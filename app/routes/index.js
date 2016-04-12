"use strict";

const express = require('express');
const router = express.Router();
const app = require('../app.js');
const ArticleGetter = require('../src/articlegetter.js');

//Get a random page and its image until you find one that works or you hit the repeat limit
function randLoop(limit) {

	console.log("randLoop's limit is ", limit);

	const AG = new ArticleGetter();

	const promise = new Promise(function(resolve, reject) {
		
		//Stop looping as soon as you get a 0 for the limit
		if(limit <= 0) reject(null);

		AG.randomPage()
		.then(AG.randomImage)
		.then(function(data) {
			console.log("In randLoop, AG.imgUrl is: ,", AG.imgUrl);
		
			resolve(data);

		})
		.catch(function(err) {
			console.log("Caught an error in randLoop!! ", err);
			console.log("Typeof err is: ", typeof err);
			if (typeof err === "string") {
				console.log("Got a string error. Reducing limit by 1");
				resolve(randLoop(limit-1));
			} else if(typeof err === "object") {
				console.log("Err is in randLoop(): ", err);

				if (err === null) {
					resolve(randLoop(5));
				} else {
					reject(err);
				}

			}
		});

	});

	return promise;
}

function* randGen(limit) {
	console.log("in randGen");
	let inThen = false;
	console.log("randGet's limit is ", limit);

	for (var i = 0; i < limit; i++) {
		console.log("In randGen at #", i);
		if (inThen) return "Done!";
		const rand = yield randLoop()
		.then(function(data) {
			inThen = true;
			res.render('index.hbs', {
			title: "WikiGuesser", 
			randTitle: data.imgTitle,
			pitcher: data.imgUrl
			});
		})
		.catch(function(err) {
			console.log("Error from randLoop: ", err);

			res.render("error.hbs", {
				error: err
			});
		});
	}
}

/* GET home page. */
router.get('/random', function(req, res, next) {
	console.log("Getting /random");
	const articleGetter = new ArticleGetter();
	console.log("Made a new AG?", !!articleGetter);
	// randGen();
	// randGen(2);
	randLoop(5)
	.then(function(data) {
		console.log("randLoop gave the data: ", data);
		res.render('index.hbs', {
			title: "WikiGuesser",
			randTitle: data.imgTitle,
			pitcher: data.imgUrl
		});
	})
	.catch(function(err) {
		console.log("Error from randLoop: ", err);

		if(err !== null) {
			res.render("error.hbs", {
				error: err
			});
		} else {
			res.redirect("../random");
		}
	});
	

});


router.get('/main', function(req, res, next) {
	res.render('main.hbs');
});


module.exports = router;
