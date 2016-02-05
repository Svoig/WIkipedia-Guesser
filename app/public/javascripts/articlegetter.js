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

		this.options = { url: this.endPoint + this.rand,
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
			console.log("ArticleGuesser encountered an error: ", err)
		};

		this.render = function() {

			const promise = Promise.resolve(self.randomPage());

			promise.then(self.randImage);
			promise.catch(self.handleError);

			return promise;

		};

		this.randomPage = function() {

			const promise = new Promise(function(resolve, reject) {

					request(self.options, function(err, req, res) {

						if(!err) {
							console.log("Made it into the !err. res is: ", res);
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

			console.log("In randomImage");
			console.log("Got data ", title, " from randomPage!");
			console.log("randomImage: encodedTitle is: ", self.encodedTitle);
			//DOESN'T GIVE ME THE IMAGE URL!! How can I use this method and still get the imgage url?
			const urlEnd = "?action=query&format=json&titles=" + self.randTitle + "&prop=images"; 
			
			self.options.url = self.endPoint + urlEnd;


			const promise = new Promise(function(resolve, reject) {

					request(self.options, function(err, req, res) {

					if (!err) {
						console.log(res);
						self.imgUrl = JSON.parse(res).query.pages[0].url;




						if(self.imgUrl === undefined) {
							return this.skip = true;
							console.log("this.imgUrl is undefined!");
						} 

						this.skip = false;
						console.log("Setting .skip to false!");

						console.log("In randomImage, imgUrl is ... ", self.imgUrl);
						resolve(self.imgUrl);

					} else throw new Error(err.message);

				});

			});

			return promise;
	};


};
return ArticleGetter;

})();

module.exports = ArticleGetter;