const request = require('request');

//Eventually accept argument for number of decoy titles to get

var ArticleGetter = (function() {


	function ArticleGetter() {
		this.name = "ArticleGetter";
		//API endpoint
		this.endPoint = "https://en.wikipedia.org/w/api.php";
		//URL for random page
		this.rand = "/w/api.php?action=query&list=random&format=json&rnnamespace=0";
		//Store last title generated, to get the article's image
		this.lastTitle =  '';

		this.toUrl = function(str) {
			//Eventually add support for special characters
			return str.split(" ").join("%20");
		};

		this.render = function() {
			console.log("render's this is...",this.name);
			this.options = { url: this.endPoint + this.rand,
				method: 'GET',
				headers: {
					'Api-User-Agent': 'WikiGuesser/0.1; harrisonccole@gmail.com', 
					"Content Type": "application/json; charset=UTF-8"
				}			
			};

			request(this.options, function(error, res){
				if (!error) {
					boundRandomPage(res);
					boundRandomImage();
				} else console.log(error);
				
			});

			var boundRandomPage = this.randomPage.bind(this);
			var boundRandomImage = this.randomImage.bind(this);


		};

		this.randomPage = function(res) {
			//Unlike jQuery, request returns JSON
			var body = JSON.parse(res.body);
			var key = body.query.random[0];
			console.log("randomPage's this is...",this.name);
			this.randTitle = key.title;
			//Going to need React for this

			this.lastTitle = this.toUrl(key.title);
		};

		this.randomImage = function() {

			var urlEnd = "?action=query&format=json&list=allimages&ailimit=1&aifrom=" + this.lastTitle.split(" ").join("%20"); 
			
			this.options.url = this.endPoint + urlEnd;

			request(this.options, function(error, res) {
				if (!error) {
					var body = JSON.parse(res.body);
					console.log(body.query.allimages[Object.keys(body.query.allimages)[0]]);
					var imgUrl = body.query.allimages[Object.keys(body.query.allimages)[0]].url;


					ArticleGetter.imgUrl = imgUrl;

					console.log("***",ArticleGetter.imgUrl,"***");

					//console.log("What is this??", this);

					if(imgUrl === undefined) {
						return this.skip = true;
						console.log("this.imgUrl is undefined!");
					} 

					this.skip = false;
					console.log("Setting .skip to false!");

				} else return error;
			});
			console.log("randomImage's this is...", this.name);

		};
	};

return ArticleGetter;

})();

module.exports = ArticleGetter;