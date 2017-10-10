var express = require('express');
var mongo = require('mongodb');
var app = express();
var bodyParser = require('body-parser');
var hands = [];

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

/*app.get('/', function(request, response) {
  response.render('pages/index');
});*/

app.get('/hands/:handId', function(request, response) {
	var hand = getHandById(request.params.handId);

	if (hand !== undefined) response.status(200).send(hand);
	else response.status(404).send(request.params.handId + ' not found');
});

app.get('/hands/:handId/cards', function(request, response) {
	var hand = getHandById(request.params.handId);

	if (hand !== undefined) {
		response.status(200).send(hand.cards);
	} else 
		response.status(404).send(request.params.handId + ' not found');
});

app.post('/hands', function(request, response) {
	var cards = request.body.cards;

	if (cards !== undefined) {
		try {
			cards = JSON.parse(cards.replace(/'/g, '"'));
		}
		catch(err) {
		}

	    //console.log(request.body.cards);
		var randomId = Math.floor(Math.random() * 99);;
		while (getHandById(randomId) !== undefined) {			
			randomId = Math.floor(Math.random() * 99);
		}
		//hands.push({'id':randomId, 'cards':dealCards(5)});
		hands.push({'id':randomId, 'cards':cards});
		response.status(200).send({'id':randomId});
	} else response.status(404).send('\'cards\' parameter not found');
});

app.put('/hands/:handId', function(request, response) {
	var hand = getHandById(request.params.handId);
	var cards = request.body.cards;

	if (hand !== undefined && cards !== undefined) {
		try {
			cards = JSON.parse(cards.replace(/'/g, '"'));
		}
		catch(err) {
		}

		replaceHand(hand.id, {"id": hand.id, "cards": cards});
		response.status(204).send("No content");
	} else 
		response.status(404).send(request.params.handId + ' not found');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function getHandById(handId) {
	var hand;

	for (var x = 0; x < hands.length; x++) {
		if (handId == hands[x].id) {
			hand = hands[x];
			break;
		}
	}

	return hand;
}

function replaceHand(handId, hand) {
	for (var x = 0; x < hands.length; x++) {
		if (handId == hands[x].id) {
			hands[x] = hand;
			break;
		}
	}
}


/*
 * Creates a Card object.
 * 
 * Contains helper functions for determining type of card.
 */
function Card(rank, suit) {
	this.rank = rank;
	this.suit = suit;

	this.numericRank = function() {
		if (this.rank == "A") return "1";
		else if (this.rank == "J") return "11";
		else if (this.rank == "Q") return "12";
		else if (this.rank == "K") return "13";
		else return rank;
	};

	// Converts short rank to full rank name if applicable.
	this.fullRank = function() {
		if (this.rank == "A") return "Ace";
		else if (this.rank == "J") return "Jack";
		else if (this.rank == "Q") return "Queen";
		else if (this.rank == "K") return "King";
		else return rank;
	};

	// Converts short suit to full suit name.
	this.fullSuit = function() {
		if (this.suit == "S") return "Spade";
		else if (this.suit == "H") return "Heart";
		else if (this.suit == "D") return "Diamond";
		else if (this.suit == "C") return "Club";
	};

	this.isRoyal = function() {
		// Cards 10 to Ace
		return this.numericRank() >= 10 || this.numericRank() == 1;
	}

	this.isValid = function() {
		// 1 - 13 and S,H,C or D
		return this.numericRank() >= 1 && this.numericRank() <= 13 && (this.suit == "S" || this.suit == "H" || this.suit == "C" || this.suit == "D");
	}

	// toString() function.
	this.toString = function() {
		// Print out function.
		return this.fullRank() + " of " + this.fullSuit() + "s";
	};

	return this;
}

/*
 * Generates a hand of cards with a given number.
 */
function dealCards(cardCount) {
	var cards = [];
	var ranks = ["a","2","3","4","5","6","7","8","9","10","j","q","k"];
	var suits = ["spades","hearts","clubs","diamonds"];

	// Check if a generated card exists in the hand already.
	function hasCard(rank, suit) {
		for (var i = 0; i < cards.length; i++) {
			if (cards[i].rank == rank && cards[i].suit == suit) return true;
			return false;
		}
	}

	for (var i = 0; i < cardCount; i++) {
		// Generate random numbers using the array length of ranks and suits.
		var rank = Math.floor((Math.random() * ranks.length));
		var suit = Math.floor((Math.random() * suits.length));

		// If the card hand does not alreayd have the generated card, push it.
		// Otherwise reset the iteration.
		if (!hasCard(rank, suit)) cards.push(new Card(ranks[rank], suits[suit]));
		else i -= 1;
	}

	//cards = [new Card(2, "H"), new Card(3, "H"), new Card(4, "H"), new Card(5, "H"), new Card(6, "H")]; // Flush/Straight
	//cards = [new Card(10, "H"), new Card("J", "H"), new Card("Q", "H"), new Card("K", "H"), new Card("A", "H")]; // Royal Flush/Straight
	//cards = [new Card(2, "H"), new Card(2, "H"), new Card(2, "H"), new Card(3, "H"), new Card(3, "H")]; // Full House
	/*cards[0].suit = "D";
	cards[1].suit = "D";
	cards[2].suit = "D";
	cards[3].suit = "D";
	cards[4].suit = "D";*/

	return cards;
}

/*
 * Assesses a hand of 5 cards.
 * 
 * Pair of 2
 * Pair of 3
 * Pair of 4
 * Flush
 * Full House
 * Straight
 * Straight Flush
 * Royal Flush
 */
function handAssessor(handOf5) {
	var hasAnyHand = false; // Used to track if there is a winning hand or not.

	/*
	 * Helper function for sorting properly.
	 */
	function sortNumber(a,b) {
	    return a - b;
	}

	/*
	 * Sort a hand with given key.
	 */
	function getSortedArray(suitOrRank) {
		var array = [];

		for (var i = 0; i < handOf5.length; i++) {
			if (suitOrRank == "rank") array.push(parseInt(handOf5[i].numericRank()));
			else if (suitOrRank == "suit") array.push(handOf5[i].suit);
		}
		array.sort(sortNumber);

		console.log(array);
		return array;
	}

	var sortedRanks = getSortedArray("rank"); // Sorted ranks
	var sortedSuits = getSortedArray("suit"); // Sorted suits.

	/*
	 * Calculate how many duplicates of a value there are.
	 */
	function hasDuplicates(array, value) {
		var dupCount = 0;
		for (var i = 0; i < array.length; i++) {
			if (array[i] == value) dupCount++; 
		}
		return dupCount;
	}

	/*
	 * Check if a pair exists based on desired count.
	 */
	function hasPair(value) {
		for (var i = 0; i < sortedRanks.length; i++) {
			if (hasDuplicates(sortedRanks, sortedRanks[i]) == value) {
				hasAnyHand = true;
				return true;
			}
		}
		return false;
	}

	/*
	 * Check for pair of 2
	 */
	function isTwoPair() {
		return hasPair(2);
	}

	/*
	 * Check for pair of 3
	 */
	function isThreePair() {
		return hasPair(3);
	}

	/*
	 * Check for pair of 4
	 */
	function isFourPair() {
		return hasPair(4);
	}

	/*
	 * Check for a flush
	 */
	function isFlush() {
		if (hasDuplicates(sortedSuits, sortedSuits[0]) == 5) {
			hasAnyHand = true;
			return true;
		}
		return false;
	}

	/*
	 * Check for a full house
	 */
	function isFullHouse() {
		if (isTwoPair() && isThreePair()) {
			hasAnyHand = true;
			return true;
		}
		return false;
	}

	/*
	 * Check for a straight
	 */
	function isStraight() {
		var newRanks = sortedRanks; // Make a copy to retain the original values.

		// This block manually sets a new array to factor start and ends
		if (newRanks[4] == 13 && newRanks[0] == 1) newRanks[4] = 0;
		if (newRanks[3] == 12 && newRanks[4] == 0) newRanks[3] = -1;
		if (newRanks[2] == 11 && newRanks[3] == -1) newRanks[2] = -2;
		if (newRanks[1] == 10 && newRanks[2] == -2) newRanks[1] = -3;
		newRanks.sort(sortNumber); // Resort

		// Check if addition of one equals the next card value
		for (var i = 0; i < 4; i++) {
			if (newRanks[i] + 1 != newRanks[i + 1]) return false; // Return false indefinitely.
		}

		hasAnyHand = true;
		return true;
	}

	/*
	 * Check for a straight flush
	 */
	function isStraightFlush() {
		if (isFlush() && isStraight()) {
			hasAnyHand = true;
			return true;
		}
		return false;
	}

	/*
	 * Check for a royal flush
	 */
	function isRoyalFlush() {
		if (isFlush()) { // Check if it's even a flush first.
			// Loop through to check each Card object to determine if it's a royal card.
			for (var i = 0; i < handOf5.length; i++) {
				if (!handOf5[i].isRoyal()) return false; // Return false indefinitely.
			}

			hasAnyHand = true;
			return true;
		}
		return false;
	}

	if (handOf5.length == 5) { // Check if the hand is 5
		var isValidHand = false; // Valid hand checker

		for (var i = 0; i < handOf5.length; i++) {
			// Check if each card is an instance of "Card" to prove the objects are correct.
			// Also check if it has a rank and suit.
			if (handOf5[i] instanceof Card && handOf5[i].isValid()) isValidHand = true;
			else console.error("Object(" + (i + 1) + ") isn't a Card");
		}

		if (isValidHand) {
			console.log("Hand: " + handOf5.toString());

			if (isTwoPair()) console.log("Two of a Kind!!");
			if (isThreePair()) console.log("Three of a Kind!!!");
			if (isFourPair()) console.log("Four of a Kind!!!!");
			if (isFlush()) console.log("Flush!");
			if (isFullHouse()) console.log("Full House!");
			if (isStraight()) console.log("Straight!");
			if (isStraightFlush()) console.log("Straight Flush!");
			if (isRoyalFlush()) console.log("Royal Flush!");
			if (!hasAnyHand) console.log("Bust");
		}
	} else console.error("5 cards are required for a hand");
}