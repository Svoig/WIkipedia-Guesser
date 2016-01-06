var endPoint = "https://en.wikipedia.org/w/api.php";

var rand = "/w/api.php?action=query&list=random&format=json&rnnamespace=0";


var lastTitle = '';

//Eventually accept argument for number of decoy titles to get
function ArticleGetter() {

	this.endPoint = "https://en.wikipedia.org/w/api.php";

	this.rand = "/w/api.php?action=query&list=random&format=json&rnnamespace=0";

	this.lastTitle =  '';

	this.toUrl = function(str) {
		//Eventually add support for special characters
		return str.split(" ").join("%20");
	};

	this.render = function() {
		var promise = $.ajax({
		url: endPoint + rand,
		dataType: 'jsonp',
		headers: {'Api-User-Agent': 'WikiGuesser/0.1; harrisonccole@gmail.com', "Content Type": "application/json; charset=UTF-8"}
		});

		var boundRandomPage = this.randomPage.bind(this);
		var boundRandomImage = this.randomImage.bind(this);

		promise.success(boundRandomPage).then(boundRandomImage);

		promise.fail(function(error) {
			console.log("ERROR: ", error)
		});
	};

	this.randomPage = function(results) {
		key = results.query.random[0];
		var randTitle = "<h3>"+key.title+"</h3>";
		$("#random").append(randTitle);

		this.lastTitle = this.toUrl(key.title);
	};

	this.randomImage = function(results) {
		var urlEnd = "?action=query&format=json&titles=" + this.lastTitle + "&prop=images&imlimt=1"; 
		

		var imgTitlePromise =  $.ajax({
			url: endPoint + urlEnd,
			type: "GET",
			contentType: "application/javascript",
			dataType: "jsonp",
			jsonpCallback: "jsonpTestCallback",
			headers: {'Api-User-Agent': 'WikiGuesser/0.1; harrisonccole@gmail.com', "Content Type": "application/json; charset=UTF-8"}
		});

		imgTitlePromise.toUrl = this.toUrl;
		imgTitlePromise.render = this.render;

		imgTitlePromise.success(function(results) {
				//console.log("Tried to GET ", endPoint + urlEnd, "with a lastTitle of ", lastTitle);
				if (results.query.pages[Object.keys(results.query.pages)[0]].images !== undefined) {

					 imgTitlePromise.imgTitle = imgTitlePromise.toUrl(results.query.pages[Object.keys(results.query.pages)[0]].images[0].title);



				} else {
					imgTitlePromise.render();
				}
		})
		.then(function() {

			var imgFileUrl = endPoint + "?action=query&format=json&prop=imageinfo&iiurlwidth=540&iiurlheight=360&iiprop=url&titles=" + imgTitlePromise.imgTitle;
			console.log("Trying to get image: ", imgFileUrl);

			var imgPromise = $.ajax({
				url: imgFileUrl,
				type: "GET",
				contentType: "application/javascript",
				dataType: "jsonp",
				jsonpCallback: "jsonpTestCallback",
				headers: {'Api-User-Agent': 'WikiGuesser/0.1; harrisonccole@gmail.com', "Content Type": "application/json; charset=UTF-8"}
			});

			imgPromise.success(function(results) {

				var filter = ['https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Ambox_important.svg/360px-Ambox_important.svg.png'];

				//Saves a lot of typing and confusion
				imgLocation = results.query.pages[Object.keys(results.query.pages)[0]].imageinfo[0];

				//Prevent the image from rendering if it's one of the excluded urls, ie the ones in the filter array
				if (imgLocation.thumburl in filter) {
					console.log("Excluded url, reloading");
					imgTitlePromise.render();
					
				};

				var imgUrl = imgLocation.thumburl;
				console.log(imgUrl);

				var newImg = $("<img src='" + imgUrl + "'>");
				$("#randImg").append(newImg);
			});
		});

		imgTitlePromise.fail(function(error) {
			console.log("ERROR: ", error);
		});

	};
};


function asynch(fn, callback) {
	setTimeout(function () {
		fn();
		callback();
	}, 0);
};


var randArticle = new ArticleGetter();

randArticle.render();
