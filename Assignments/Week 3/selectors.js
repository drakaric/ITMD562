$(document).ready(function() {
	var timer = 0;
	$(".relevant").children().each(function() {
		$(this).delay(timer).fadeIn();
		var rgb = RandomRGB();
		var rgbInv = inverseRGB(rgb);
		$(this).css("color", "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")");
		$(this).css("background-color", "rgb(" + rgbInv[0] + "," + rgbInv[1] + "," + rgbInv[2] + ")");
		timer += 300;
	});
});

/**
 * Using random math and 256-bit RGB, generate a random color.
 */
function RandomRGB() {
	var rgb = [0, 0, 0];

	for (var i = 0; i < rgb.length; i++) {
		rgb[i] = Math.floor((Math.random() * 256));
	}

	return rgb;
}

/**
 * Inverse a RGB array.
 */
function inverseRGB(rgb) {
	var rgbInv = [0, 0, 0];

	for (var i = 0; i < rgb.length; i++) {
		console.log(rgb[i]);
		rgbInv[i] = 255 - rgb[i];
	}

	return rgbInv;
}