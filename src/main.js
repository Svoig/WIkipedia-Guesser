
//Eventually accept argument for number of decoy titles to get
function ArticleGetter() {
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

		var promise = $.ajax({
		url: this.endPoint + this.rand,
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
			url: this.endPoint + urlEnd,
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
				return;
			}
			//Can't use this.endPoint because of binding
			var imgFileUrl = randArticle.endPoint + "?action=query&format=json&prop=imageinfo&iiurlwidth=540&iiurlheight=360&iiprop=url&titles=" + imgTitlePromise.imgTitle;
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
				return;
				}
				//Filter out icons and other unwanted images
				//Not the best way of doing things, but it works
				var filter = {
					'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Ambox_important.svg/360px-Ambox_important.svg.png': '!',
				 'https://upload.wikimedia.org/wikipedia/commons/7/74/Red_Pencil_Icon.png':'pencil',
				  'https://upload.wikimedia.org/wikipedia/en/thumb/6/62/PD-icon.svg/360px-PD-icon.svg.png': 'noCopy',
				   'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Disambig_gray.svg/472px-Disambig_gray.svg.png': 'usb',
				    'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Commons-logo.svg/268px-Commons-logo.svg.png': 'wikimedia',
					'https://upload.wikimedia.org/wikipedia/en/thumb/4/48/Folder_Hexagonal_Icon.svg/418px-Folder_Hexagonal_Icon.svg.png': 'folder',
					'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Nuvola_apps_kruler.svg/360px-Nuvola_apps_kruler.svg.png': 'ruler',
					'https://upload.wikimedia.org/wikipedia/commons/2/28/Crystal_kchart.png': 'crystal_kchart',
					'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mplayer.svg/360px-Mplayer.svg.png': 'film',
					'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/DAB_list_gray.svg/472px-DAB_list_gray.svg.png': 'three_arrows'
				};

				//Saves a lot of typing and confusion
				imgLocation = results.query.pages[Object.keys(results.query.pages)[0]].imageinfo[0];

				//Prevent the image from rendering if it's one of the excluded URLs, i.e. the ones in the filter array
				if (imgLocation.thumburl in filter) {
					console.log("Excluded url, reloading");
					//Get rid of false positive title
					$("#random").html('');
					randArticle.render();
					return;
					
				};

				var imgUrl = imgLocation.thumburl;
				//Log the URL in case it should be excluded
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
