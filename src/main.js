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
		//BUG: Sometimes get 'Cannot read property "bind" of undefined @main.js:30'
		//I think it's when a page has no picture. I call imgTitlePromise.render, which tries to find a randomPage and randomImage method within its own scope. I'll have to think of a better way to handle this. Global...?
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

		imgTitlePromise.skip =  false;

		imgTitlePromise.success(function(results) {
				//console.log("Tried to GET ", endPoint + urlEnd, "with a lastTitle of ", lastTitle);
				if (results.query.pages[Object.keys(results.query.pages)[0]].images !== undefined) {

					 imgTitlePromise.imgTitle = randArticle.toUrl(results.query.pages[Object.keys(results.query.pages)[0]].images[0].title);

				} else {
					console.log("No image. Setting skip to true");
					imgTitlePromise.skip =  true;
					randArticle.render();
				}
		})
		.then(function() {

			if (imgTitlePromise.skip === true) {
				console.log("No picture - skipped");
				if($("#random").innerHTML !== '') {
					$("#random").html('');
				}
				return "No picture - skipped";
			}

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

				if (imgTitlePromise.skip === true) {
				console.log("No picture - skipped");
				return "No picture - skipped";
				}

				var filter = {'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Ambox_important.svg/360px-Ambox_important.svg.png': '!',
				 'https://upload.wikimedia.org/wikipedia/commons/7/74/Red_Pencil_Icon.png':'pencil',
				  'https://upload.wikimedia.org/wikipedia/en/thumb/6/62/PD-icon.svg/360px-PD-icon.svg.png': 'noCopy',
				   'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Disambig_gray.svg/472px-Disambig_gray.svg.png': 'usb',
				    'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Commons-logo.svg/268px-Commons-logo.svg.png': 'wikimedia'};

				//Saves a lot of typing and confusion
				imgLocation = results.query.pages[Object.keys(results.query.pages)[0]].imageinfo[0];

				//Prevent the image from rendering if it's one of the excluded urls, ie the ones in the filter array
				if (imgLocation.thumburl in filter) {
					console.log("Excluded url, reloading");
					$("#random").html('');
					randArticle.render();
					return "ERROR, no picture on page. Reloading";
					
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
