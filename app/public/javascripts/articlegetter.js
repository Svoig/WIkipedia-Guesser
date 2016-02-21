const request = require('request');

//Eventually accept argument for number of decoy titles to get

const ArticleGetter = (function() {


	function ArticleGetter() {

		const self = this;

		this.name = "ArticleGetter";
		//API endpoint
		this.endPoint = "https://en.wikipedia.org/w/api.php";
		//URL for random page
		this.rand = "?action=query&list=random&format=json&rnnamespace=0";
		//Store last title generated, to get the article's image
		this.lastTitle =  '';

		this.options = {
				method: 'GET',
				headers: {
					'Api-User-Agent': 'WikiGuesser/0.1; harrisonccole@gmail.com', 
					'Content-Type': 'application/json; charset=UTF-8'
				}			
			};

		this.toUrl = function(str) {
			//Eventually add support for special characters
			return str.split(" ").join("%20");
		};

		this.handleError = function(err) {
			console.log("Handling error ", err);
			if (err === true && self.skip === true) {

				const promise = new Promise(function(resolve, reject) {
					self.render();
				})
				.catch(self.handleError);

			} else {
				console.log("ArticleGuesser encountered an error: ", err);
			}
		};

		this.render = function() {

			const promise = new Promise(function(resolve, reject) {
				resolve(self.randomPage());
			})
			.then(function(data) {
				self.randomImage(data);
			})
			.catch(self.handleError);

			return promise;

		};

		this.randomPage = function() {

			const promise = new Promise(function(resolve, reject) {

				self.options.url = self.endPoint + self.rand;

					request(self.options, function(err, req, res) {

						if(!err) {
							self.randTitle = JSON.parse(res).query.random[0].title;
							self.encodedTitle = self.toUrl(self.randTitle);
							resolve(self.encodedTitle);

						} else throw new Error(err);

					});
			});

			promise.catch(self.handleError);

			return promise;

		};

		this.randomImage = function(title) {

			console.log("Got data ", title, " from randomPage!");
			
			const urlEnd = "?action=query&format=json&titles=" + self.randTitle + "&prop=images"; 
			
			self.options.url = self.endPoint + urlEnd;


			const promise = new Promise(function(resolve, reject) {

					request(self.options, function(err, req, res) {

					if (!err) {
						const query = JSON.parse(res).query;
						const key = Object.keys(query.pages)[0];

						if(!query.pages[key].images) {
							console.log("No images!");
							self.skip = true;
							reject(self.skip);
						} else {
							console.log("setting skip to false line 106");
						self.skip = false;
						self.imgTitle = query.pages[key].images[0].title;

						console.log("In randomImage, imgTitle is ... ", self.imgTitle);

						self.encodedImgTitle = self.toUrl(self.imgTitle)


						const p2 = new Promise(function(resolve, reject) {
							self.options.url = self.endPoint + "?action=query&format=json&titles=" + self.imgTitle + "&prop=imageinfo&iiprop=url&iiurlwidth=270&iiurlheight=180";

							request(self.options, function(err, req, res) {
								if (!err) {
									const query = JSON.parse(res).query;
									const key  = query.pages[Object.keys(query.pages)[0]];

									if (key.imageinfo[0].url.slice(-4) === ".svg") {
										console.log("It's an svg!");
										self.skip = true;
										reject(self.skip);
									} else {
										console.log("Not an svg");
										console.log("Setting skip to false, line 134");
										self.skip = false;
										self.imgUrl = key.imageinfo[0].thumburl;
										resolve(self.imgUrl);
									}
								} else {
									throw new Error(err.message);
								}
							});

						});
						
						resolve(p2);

						}					


					} else throw new Error(err.message);

				});

			});

			promise.then(function() {
			});

			promise.catch(self.handleError);

			return promise;
	};


};
return ArticleGetter;

})();

module.exports = ArticleGetter;