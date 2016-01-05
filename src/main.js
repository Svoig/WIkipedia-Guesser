var endPoint = "https://en.wikipedia.org/w/api.php";

var rand = "/w/api.php?action=query&list=random&format=json&rnnamespace=0";


var lastTitle = '';

//Eventually accept argument for number of decoy titles to get
function ArticleGetter() {

	this.endPoint = "https://en.wikipedia.org/w/api.php";

	this.rand = "/w/api.php?action=query&list=random&format=json&rnnamespace=0";

	this.lastTitle =  '';

	this.render = function() {
		var promise = $.ajax({
		url: endPoint + rand,
		dataType: 'jsonp',
		headers: {'Api-User-Agent': 'WikiGuesser/0.1; harrisonccole@gmail.com', "Content Type": "application/json; charset=UTF-8"}
		});

		promise.success(this.randomPage).then(this.randomImage);

		promise.fail(function(error) {
			console.log("ERROR: ", error)
		});
	};

	this.randomPage = function(results) {
		key = results.query.random[0];
		//console.log(key);
		var randTitle = "<h3>"+key.title+"</h3>";
		$("#random").append(randTitle);

		this.lastTitle = key.title.split(' ').join('%20');
		//console.log('Setting lastTitle to ', lastTitle);
	};

	this.randomImage = function(results) {
		var urlEnd = "?action=query&list=allimages&format=json&aiprop=url&aisort=name&aifrom=" + this.lastTitle; 
		

		var imgPromise =  $.ajax({
			url: endPoint + urlEnd,
			type: "GET",
			contentType: "application/javascript",
			dataType: "jsonp",
			jsonpCallback: "jsonpTestCallback",
			headers: {'Api-User-Agent': 'WikiGuesser/0.1; harrisonccole@gmail.com', "Content Type": "application/json; charset=UTF-8"}
		});

		imgPromise.success(function(results) {
				//console.log("Tried to GET ", endPoint + urlEnd, "with a lastTitle of ", lastTitle);
				var key = results.query.allimages[0].url;
				var keyTitle = results.query.allimages[0].title;

				var newImg = "<img src='" + key + "'>";

				$("#randImg").append(newImg);
			});

		imgPromise.fail(function(error) {
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
