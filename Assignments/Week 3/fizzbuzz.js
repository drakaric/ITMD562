$(document).ready(function() {
	fizzbuzz(1, 100);
});

function isMultiple(eval, multiple) {
	return eval % multiple == 0;
}

function RangeException() {
	this.message = "Starting number must not exceed ending number";
	this.name = "RangeException";
}

function fizzbuzz(start, end) {
	try {
		if (start <= end) {
			while (start <= end) {
				var isMult3 = isMultiple(start, 3);
				var isMult5 = isMultiple(start, 5);

				if (isMult3 && isMult5) document.write("FizzBuzz (" + start + ")<br>");
				else if (isMult3) document.write("Fizz (" + start + ")<br>");
				else if (isMult5) document.write("Buzz (" + start + ")<br>");
				else document.write(start + "<br>");

				start++;
			}
		} else throw new RangeException();
	} catch (e) {
		document.write(e.message);
		console.error(e.message);
	}
}