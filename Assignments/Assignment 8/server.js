/********************/
/***** REQUIRES *****/
/********************/

var express = require('express');
var assert = require('assert');
var util = require('util');
var bodyParser = require('body-parser');
var http = require("http");
var app = express();
var jade = require('jade');
var request = require('request');


/*******************/
/***** OBJECTS *****/
/*******************/

// Holder arrays.
var users = [];
var reminders = [];

// Sequences.
var userSeq = 0;
var reminderSeq = 0;

// Determines the next available user ID.
function nextUserId() {
	return ++userSeq;
}

// Determines the next available reminder ID.
function nextReminderId() {
	return ++reminderSeq;
}

// Defines a User.
function User(id, name, email) {
	this.id = id;
	this.name = name;
	this.email = email;
	this.reminderIds = [];

	this.addReminderId = function(reminderId) {
		if (!this.hasReminderId(reminderId))
			this.reminderIds.push(reminderId);
	};

	this.hasReminderId = function(reminderId) {
		for (var i = 0; i < this.reminderIds.length; i++) {
			if (this.reminderIds[i] == reminderId)
				return true;
		}
		return false;
	};

	return this;
}

// Defines a Reminder.
function Reminder(id, title, desc, userId) {
	this.id = id;
	this.title = title;
	this.description = desc;
	this.userId = userId;
	this.created = new Date();

	return this;
}

// Defines a Response.
function Response(status, msg, showErrorMsg) {
	this.status = status;
	this.msg = msg;
	if (showErrorMsg && status == 404 && msg === undefined) this.msg = "No results were found";

	return this;
}


/*****************************/
/***** RESPONSE MESSAGES *****/
/*****************************/

// Generate an output for an ID.
function generateIdOutput(id) {
	return {"id": id};
}

// Generate an output for a user
function generateUserOutput(user) {
	return { "id" : user.id, "name" : user.name, "email" : user.email };
}

// Generate an output for a reminder.
function generateReminderOuput(reminder) {
	return { "id" : reminder.id, "title" : reminder.title, "description" : reminder.description, "created" : reminder.created };
}


/****************************/
/***** HELPER FUNCTIONS *****/
/****************************/

// Repsonse initializer for JSON
function initResponse(response) {
	response.set('Content-Type', 'application/json');
}

// Helper function that pushes to an array, and returns the object.
function pushToArray(array, object) {
	array.push(object);

	return array[array.length - 1];
}

// Searches the users with a given user ID.
// Returns index of the array.
function findUserIndexById(userId) {
	for (var i = 0; i < users.length; i++) {
		if (users[i].id == userId)
			return i;
	}
}

// Searches the users with a given user ID.
// Returns the user object.
function findUserById(userId) {
	var userIdx = findUserIndexById(userId);
	return users[userIdx];
}

// Searches the reminders with a given and user ID.
// Returns all of the reminder holder indexes of the array.
function findAllUserReminderIndices(userId) {
	var reminderIdc = [];

	for (var i = 0; i < reminders.length; i++) {
		if (reminders[i].userId == userId)
			reminderIdc.push(i);
	}

	return reminderIdc;
}

// Searches the reminders with a given reminder ID and user ID.
// Returns index of the array.
function findReminderIndexByUserId(userId, reminderId) {
	for (var i = 0; i < reminders.length; i++) {
		if (reminders[i].id == reminderId && reminders[i].userId == userId)
			return i;
	}
}

function postDummyData(URL, body) {
	console.log("Post Dummy Data: ", URL, " -> ", body);

    var options = {
	  method: "POST",
	  body: body,
	  json: true,
	  url: URL
	}

	request(options, function (err, res, body) {
	  if (err) {
	    console.log("Error: ", err);
	    return;
	  }
	  console.log("Body Result:", body);
	});
}


/*********************************/
/***** SERVER INITIALIZATION *****/
/*********************************/

app.set("port", (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//set view engine
app.set("view engine","jade");

app.listen(app.get("port"), function() {
	console.log("Node app is running on port", app.get("port"));

	/*var dummyUser = {"user":{"name":"Daniel Rakaric","email":"drakaric@iit.com"}};
	var dummyReminder = {"reminder":{"title":"Drink Ovaltine","description":"Remember to drink your Ovaltine"}};

	postDummyData("http://localhost:5000/users", dummyUser);
	postDummyData("http://localhost:5000/users/1/reminders", dummyReminder);*/

	// Keep alive for Heroku
	/*setInterval(function() {
		var keepAliveURL = "http://thawing-escarpment-95184.herokuapp.com";

		http.get(keepAliveURL);

		console.log("Sent keep alive request to " + keepAliveURL);
	}, 300000);*/
});


/****************************/
/***** APPLICATION URIS *****/
/****************************/


/*** GET METHODS START ***/

app.get("/", function(request, response) {
	//response.status(200).send({"appStatus": "Running"});
	response.render("main", {"userId": ""});
});

app.get("/users/:userId", function(request, response) {
	var userId = request.params.userId;

	var returnResponse = getUserById(userId);

	response.status(returnResponse.status).send(returnResponse.msg);
});

app.get("/users/:userId/reminders", function(request, response) {
	var userId = request.params.userId;
	var query = request.query.title;

	var returnResponse = getAllRemindersForUser(userId, query);

	response.status(returnResponse.status).send(returnResponse.msg);
});

app.get("/getUsers/:userId", function(request, response) {
	var userId = request.params.userId;

	var returnResponse = getUserById(userId);
	if (returnResponse.status == 404 && returnResponse.msg === undefined) returnResponse.msg = "No results were found";

	response.render("main", {"user": returnResponse.msg, "userId": userId});
});

app.get("/getUsers/:userId/reminders", function(request, response) {
	var userId = request.params.userId;
	var query = request.query.title;

	var returnResponse = getAllRemindersForUser(userId, query);
	if (returnResponse.status == 404 && returnResponse.msg === undefined) returnResponse.msg = "No results were found";

	//console.log("Reminder search status:", returnResponse.status);
	//console.log("Reminders:", returnResponse.msg);
	response.render("main", {"reminders": returnResponse.msg, "userId": userId, "query" : query, "status": returnResponse.status});
});

app.get("/users/:userId/reminders/:reminderId", function(request, response) {
	var returnResponse = getReminderForUser(request.params.userId, request.params.reminderId);

	response.status(returnResponse.status).send(returnResponse.msg);
});

/*** GET METHODS END ***/


/*** POST METHODS START ***/

app.post("/users", function(request, response) {
	initResponse(response);

	var returnResponse = createUser(request.body.user);

	response.status(returnResponse.status).send(returnResponse.msg);
});

app.post("/users/:userId/reminders", function(request, response) {
	initResponse(response);

	var returnResponse = createReminderForUser(request.params.userId, request.body.reminder);

	response.status(returnResponse.status).send(returnResponse.msg);
});

/*** POST METHODS END ***/


/*** DELETE METHODS START ***/

app.delete("/users/:userId", function(request, response) {
	var returnResponse = deleteUserById(request.params.userId);

	response.status(returnResponse.status).send(returnResponse.msg);
});

app.delete("/users/:userId/reminders", function(request, response) {
	var returnResponse = deleteRemindersByUserId(request.params.userId);

	response.status(returnResponse.status).send(returnResponse.msg);
});

app.delete("/users/:userId/reminders/:reminderId", function(request, response) {
	var returnResponse = deleteReminderForUserById(request.params.userId, request.params.reminderId);

	response.status(returnResponse.status).send(returnResponse.msg);
});

/*** DELETE METHODS END ***/


/**************************************/
/***** MAIN APPLICATION FUNCTIONS *****/
/**************************************/

// Create a new user.
function createUser(user) {
	// Checks if the user exists.
	if (user === undefined)
		return Response(404);

	// Create and add the new user to the holder
	var user = pushToArray(users, new User(nextUserId(), user.name, user.email));

	return Response(200, generateIdOutput(user.id));
}

// Create a new reminder for a user.
function createReminderForUser(userId, reminder) {
	// Check if the reminder/user exists.
	if (reminder === undefined || findUserById(userId) === undefined)
		return Response(404);

	// Create and add the new reminder to the holder
	var reminder = pushToArray(reminders, new Reminder(nextReminderId(), reminder.title, reminder.description, userId));

	return Response(200, generateIdOutput(reminder.id));
}

// Get a user by an ID.
function getUserById(userId) {

	// Checks if the user ID exists.
	if (userId === undefined)
		return Response(404);

	var user = findUserById(userId);

	// Check if the user exists.
	if (user === undefined)
		return Response(404);

	return Response(200, generateUserOutput(user));
}

// Get a reminder for a user by their IDs.
function getReminderForUser(userId, reminderId) {
	// Checks if the user ID/user exists.
	if (userId === undefined || findUserById(userId) === undefined)
		return Response(404);

	// Get the reminder index if it exists.
	var reminderIdx = findReminderIndexByUserId(userId, reminderId);

	// If the index exists, return the object.
	if (reminderIdx !== undefined)
		return Response(200, generateReminderOuput(reminders[reminderIdx]));
	
	return Response(404);
}

// Get all reminder for a user.
// Search parameter included.
function getAllRemindersForUser(userId, searchParam) {
	// Checks the status of the search parameter.
	var hasSearchParam = searchParam !== undefined && searchParam != "";

	// Checks if the user ID/user exists.
	if (userId === undefined || findUserById(userId) === undefined)
		return Response(404);

	var userReminders = [];
	// Search the array of reminders.
	// If the reminder has the user ID,
	// and if the search parameter exists,
	// add to the returnable list.
	for (var i = 0; i < reminders.length; i++) {
		if (userId == reminders[i].userId && (!hasSearchParam || searchParam == reminders[i].title))
			userReminders.push(generateReminderOuput(reminders[i]));
	}

	// If the list is not empty, return the array.
	if (userReminders.length > 0)
		return Response(200, userReminders);

	return Response(404);
}

// Delete a user by an ID.
// Also removes reminders if applicable.
function deleteUserById(userId) {
	
	// Check if the user ID exists.
	if (userId === undefined)
		return Response(404);

	//Retrieve the index of the object from the User list
	var userIdx = findUserIndexById(userId);

	// Check if the user index exists.
	if (userIdx === undefined)
		return Response(404);

	// Remove the user from the array holder by index.
	users.splice(userIdx, 1);

	// Remove any existing reminders for the user.
	deleteRemindersByUserId(userId);

	return Response(204);
}

// Delete all reminders for a user by an ID.
function deleteRemindersByUserId(userId) {

	// Check if the user ID exists.
	if (userId === undefined)
		return Response(404);

	// Get the reminder indices for the user to remove.
	var userReminderIdc = findAllUserReminderIndices(userId);

	if (userReminderIdc.length > 0) {
		// The indices will return in order.
		// Iterate backwards to the latest index is removed first,
		// to prevent the indexes from changing mid-loop.
		for (var i = userReminderIdc.length -1; i >= 0; i--) {
			// Remove the reminder from the array holder by index.
			reminders.splice(userReminderIdc[i], 1);
		}

		return Response(204);
	}

	return Response(404);
}

// Delete a reminder for a user by IDs.
function deleteReminderForUserById(userId, reminderId) {

	// Checks if the user ID/user/reminder ID exists.
	if (userId === undefined || findUserIndexById(userId) === undefined || reminderId === undefined)
		return Response(404);

	// Get the reminder index if it exists.
	var reminderIdx = findReminderIndexByUserId(userId, reminderId);

	// If the index exists, remove it.
	if (reminderIdx !== undefined) {
		reminders.splice(reminderIdx, 1);

		return Response(204);
	}

	return Response(404);
}

// Testing
module.exports = app;