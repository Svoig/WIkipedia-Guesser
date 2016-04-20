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
			return unescape(decodeURIComponent(str));
		};

		this.handleError = function(err) {
			console.log("Handling error ", err);			
		};

		this.render = function() {

			const promise = new Promise(function(resolve, reject) {
				resolve(self.randomPage());
			})

			promise.then(function(data) {
				self.randomImage(data);
			});

			return promise;

		};

		this.randomPage = function() {

			const promise = new Promise(function(resolve, reject) {

				self.options.url = self.endPoint + self.rand;

					request(self.options, function(err, req, res) {

						if(!err) {
							console.log("Trying something out... ", decodeURIComponent(unescape(JSON.parse(res).query.random[0].title)));
							self.randTitle = JSON.parse(res).query.random[0].title;
							console.log("About to parse URI: ", self.randTitle);
							self.encodedTitle = self.toUrl(self.randTitle);
							resolve(self.encodedTitle);

						} else throw new Error(err);

					});
			});

			return promise;

		};

		this.randomImage = function(title) {

			//console.log("Got data ", title, " from randomPage!");
			
			const urlEnd = "?action=query&format=json&titles=" + self.randTitle + "&prop=images"; 
			
			self.options.url = self.endPoint + urlEnd;


			const promise = new Promise(function(resolve, reject) {

					request(self.options, function(err, req, res) {

					if (!err) {
						const query = JSON.parse(res).query;
						const key = Object.keys(query.pages)[0];

						if(!query.pages[key].images) {
							//console.log("No images! skip = true line 103");

							reject(title);
						} else {
							//console.log("setting skip to false line 106");
						self.skip = false;
						self.imgTitle = query.pages[key].images[0].title;

						//console.log("In randomImage, imgTitle is ... ", self.imgTitle);

						self.encodedImgTitle = self.toUrl(self.imgTitle)


						const p2 = new Promise(function(resolve, reject) {
							self.options.url = self.endPoint + "?action=query&format=json&titles=" + self.imgTitle + "&prop=imageinfo&iiprop=url&iiurlwidth=270&iiurlheight=180";

							request(self.options, function(err, req, res) {
								if (!err) {
									const query = JSON.parse(res).query;
									const key  = query.pages[Object.keys(query.pages)[0]];

									if ( self.filter(key.imageinfo[0].url) === false ) {
										//console.log(title, "Ends in svg, rerandoming, line 126");

										reject(title);
									} else {
										//console.log("Setting skip to false, line 133");
										self.skip = false;
										self.imgUrl = key.imageinfo[0].thumburl;

										const articleInfo = {
											imgUrl: self.imgUrl,
											imgTitle: title
										};

										resolve(articleInfo);
									}
								} else {
									throw new Error(err.message);
								}
							});
						});

						p2.catch(function(err) {
							// console.log("Error! AG: Rejecting p2 for ", err);
							reject(err);
						});
						
						resolve(p2);

						}					


					} else throw new Error(err.message);

				});

			});

			promise.catch(function(err) {
				// console.log("Error! AG: Rejecting promise for ", err);
				reject(err);
			});

			return promise;
		};

	this.filter = function(img) {
		if (img.slice(-4) === ".svg") {
			if (img.slice(9) !== "File:Flag") {
				return false;
			} else return true;
		} else return true;
	}


};
return ArticleGetter;

})();

module.exports = ArticleGetter;