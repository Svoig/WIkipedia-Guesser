var endPoint = "https://en.wikipedia.org/w/api.php";

var rand = "/w/api.php?action=query&list=random&format=json&rnnamespace=0";

var title = '';

var lastTitle = '';


function asynch(fn, callback) {
	setTimeout(function () {
		fn();
		callback();
	}, 0);
};

function render() {
	var promise = $.ajax({
		url: endPoint + rand,
		dataType: 'jsonp',
		headers: {'Api-User-Agent': 'WikiGuesser/0.1; harrisonccole@gmail.com', "Content Type": "application/json; charset=UTF-8"}
	});

	promise.success(randomPage).then(randomImage);

	promise.fail(function(error) {
		console.log("ERROR: ", error)
	});
}

function randomPage(results) {

	key = results.query.random[0];
	console.log(key);
	var randTitle = "<h3>"+key.title+"</h3>";
	$("#random").append(randTitle);

	lastTitle = key.title.split(' ').join('%20');
	console.log('Setting lastTitle to ', lastTitle);
};


function randomImage() {

	var urlEnd = "?action=query&list=allimagesformat=json&aiprop=url&aifrom="; 
	urlEnd += String(lastTitle);
	console.log("Trying to add ", lastTitle, " to ", urlEnd);

	var imgPromise =  $.ajax({
		url: endPoint + urlEnd,
		dataType: "jsonp",
		jsonp: "false",
		jsonpCallback: //SET TO WHAT I EXPECT TO GET BACK FROM API!
		headers: {'Api-User-Agent': 'WikiGuesser/0.1; harrisonccole@gmail.com', "Content Type": "application/json; charset=UTF-8"}
	});

	imgPromise.success(function(results) {
			console.log("Tried to GET ", endPoint + urlEnd, "with a lastTitle of ", lastTitle);
			var key = results.query.allimages[0].url;
			var keyTitle = results.query.allimages[0].title;

			var newImg = "<img src='" + key + "'>";

			$("#randImg").append(newImg);
		});

	imgPromise.fail(function(error) {
		console.log("ERROR: ", error);
	});
}; 

render();