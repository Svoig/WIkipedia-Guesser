$(document).ready(function() {

	var arr = $("#choices ul li");

	for (var i = 0; i < 4; i++) {
		if (arr[i].textContent == $("#correct h1").html()) {
			$(arr[i]).addClass("answer");
		} else {

		}
	}

	function flash(elem) {

		while (flashCounter < 20) {

			flashCounter++;

			if( elem.hasClass('hidden') ) {
				elem.fadeIn();
				elem.removeClass('hidden');
			} else {
				elem.fadeOut();
				elem.addClass('hidden');
			}

			return flash(elem);
		}
	}

	var flashCounter = 0;

	$(".answer").click(function() {
		if( $(".answer").hasClass("clicked") ) {
			return;
		} else {
			$(".answer").addClass("clicked");
			console.log("About to parse score of ", $("#score-val").html());
			
			if( typeof $("#score-val").html() !== "number") {
				var score = parseInt($("#score-val").html());
				console.log("parsed score is ", score);
			} else console.log("score is ", score);
			
			$("#score-input").val(score + 1);

			flash($("#loading"));
			console.log("***score-form's data is ", $("#score-form").html());
			$("#score-form").submit();

		}

	});

	$("#new-game-btn").click(function() {
		$("#score-input").val("new-game");

		flash($("#loading"));

		$("#score-form").submit();
	});

});