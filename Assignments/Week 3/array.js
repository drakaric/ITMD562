function max(intArray) {
	if (intArray.length > 0) {
		// Initialize the return array for the largest 3 values.
		var top3 = new Array();

		// Sort the array first.
		intArray.sort(function(a, b) {
		    if (a < b) return 1;
		    else if (a == b) return 0;
		    else return -1;
		});

		// While iterating through the array, set the top 3 array by limiting the count to 3.
		for (var i = 0; i < intArray.length; i++) {
			if (i < 3) top3[i] = intArray[i];
			else break;
		}

		return top3;
	} else return "No values to calculate.";
}

$(document).ready(function() {
	var intArray = new Array(99,2,55,124,390,60,11);
	//var intArray = new Array(1);
	var top3 = max(intArray);
	document.write(top3);
});