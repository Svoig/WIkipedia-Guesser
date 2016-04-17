"use strict";

const express = require('express');
const router = express.Router();
const app = require('../app.js');
const ArticleGetter = require('../src/articlegetter.js');

//Get a random page and its image until you find one that works or you hit the repeat limit
function randLoop(limit) {

	//console.log("randLoop's limit is ", limit);

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
			//console.log("Caught an error in randLoop!! ", err);
			//console.log("Typeof err is: ", typeof err);
			if (typeof err === "string") {
				//console.log("Got a string error. Reducing limit by 1");
				return resolve(randLoop(limit-1));
			} else if(typeof err === "object") {
				//console.log("Err is in randLoop(): ", err);

				if (err === null) {
					return reject(null);
				} else {
					return reject(err);
				}

			}
		});

	});

	return promise;
}

function* randGen(limit) {
	const AG = new ArticleGetter();

	let counter = 0;

	while(counter < 3) {
		yield AG.randomPage();
	}
}


function multipleChoice(received) {

	const promise = new Promise(function(resolve, reject) {

		console.log("Let's do some multipleChoice");
		//Object that will hold final data and get passed to next function in chain
		const obj = {imgUrl: received.imgUrl, correct: decodeURI(received.imgTitle)};
		//Array to push into
		const arr = [received.imgTitle];

		//Array to shuffle into
		const temp = [];

		//Generator
		const gen = randGen();

		const p1 = new Promise(function(resolve, reject) {
			

			gen.next().value
			.then(function(data) {
				console.log("After the first gen.next(), data is ", data);
				arr.push(data);
				gen.next().value
				.then(function(data) {
					arr.push(data);
					gen.next().value
					.then(function(data) {
						arr.push(data);
						resolve(arr);
					});
				});
			});
		});

		p1.catch(function(err) {
			console.log("multipleChoice's p1, error! ", err);
		});

		p1.then(function() {
			console.log("After all the promises, arr is ", arr);

			for (let i = 0; i < 4; i++) {
				const rand = Math.floor(Math.random() * arr.length);
				console.log("Before splicing ", i, " time, arr is ", arr);
				const spliced = decodeURI(arr.splice(rand-1, 1));
				console.log("Spliced ", spliced, " out using number ", rand);
				console.log("Now arr is ", arr);
				temp.push(spliced);
			}

			obj.titles = temp;
			resolve(obj);
		});
	});


	return promise;

}

/* GET home page. */
router.get('/random', function(req, res, next) {
	console.log("Getting /random");
	const AG = new ArticleGetter();
	console.log("Made a new AG?", !!AG);
	randLoop(5)
	.then(function(data) {
		//Pass data through to the next .then()
		return multipleChoice(data);

	})
	.then(function(data) {
		console.log("randLoop - multipleChoice - multipleChoice gave the data: ", data);
		res.render('game.jade', {
			title: "WikiGuesser",
			randTitle: "Round 1",
			title0: data.titles[0],
			title1: data.titles[1],
			title2: data.titles[2],
			title3: data.titles[3],
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


router.get('/', function(req, res, next) {
	res.render('main.jade');
});


module.exports = router;
