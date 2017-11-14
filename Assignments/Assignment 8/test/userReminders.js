/**********************/
/*** Initialization ***/
/**********************/

// Test mode
process.env.NODE_ENV = 'test';

// Requires from dev-dependencies configuration
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
chai.use(chaiHttp);
let doRequest = chai.request(server);


/******************************/
/*** Dummy data and Helpers ***/
/******************************/

var dummyUserName = "Joe Schmo";
var dummyUserEmail = "jschmo@example.com";
var testUserObj = {"user" : {"name": dummyUserName,"email": dummyUserEmail}};

var dummyRemTitle = "Drink Ovaltine";
var dummyRemDesc = "Remember to drink your Ovaltine";
var testReminderObj = {"reminder" : {"title": dummyRemTitle, "description": dummyRemDesc}};

var uriUsers = "/users/";
var uriReminders = "/reminders/";

function uriUser(userId) {
	return uriUsers + userId;
}

function uriReminder(userId, reminderId) {
	if (reminderId !== undefined)
		return uriUsers + userId + uriReminders + reminderId;
	return uriUsers + userId + uriReminders;
}


/************************/
/*** Test Users START ***/
/************************/
describe('Users', () => {

	// Data must be seeded first.
    beforeEach((dummyData) => {
		doRequest
			.post(uriUsers)
			.send(testUserObj)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a("object");
				res.body.should.have.property('id');
				dummyData();
			});
	});

	describe("Get a user by ID (Success)", () => {
		it("it should get a user by seeded ID", (dummyData) => {
			doRequest
				.get(uriUser(1))
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a("object");
					res.body.should.have.property("name");
					res.body.should.have.property("email");
					res.body.name.should.eql(dummyUserName);
					res.body.email.should.eql(dummyUserEmail);
					dummyData();
				});
		});
	});

	describe("Get a user by ID (Failure)", () => {
		it("it should NOT get a user by ID 0", (done) => {
			doRequest
				.get(uriUser(0))
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
	});

	describe("Create user (Success)", () => {
		it("it should create a new user", (done) => {
			doRequest
				.post(uriUsers)
				.send(testUserObj)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a("object");
					res.body.should.have.property('id');
					done();
				});
		});
	});

	describe("Create user (Failure)", () => {
		it("it should NOT create a new user. No data sent", (done) => {
			doRequest
				.post(uriUsers)
				.send({})
				.end((err, res) => {
					(res !== null).should.be.true;
					done();
				});
		});
	});

	describe("Delete a user (Success)", () => {
		it("it should delete a user by seeded ID", (dummyData) => {
			doRequest
				.delete(uriUser(1))
				.end((err, res) => {
					res.should.have.status(204);
					dummyData();
				});
		});
	});

	describe("Delete a user (Failure)", () => {
		it("it should NOT delete a user by ID 0", (done) => {
			doRequest
				.delete(uriUser(1))
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
	});
});
/**********************/
/*** Test Users END ***/
/**********************/


/****************************/
/*** Test Reminders START ***/
/****************************/
describe('Reminders', () => {

	// Data must be seeded first.
    beforeEach((dummyData) => {
		doRequest
			.post(uriReminder(2))
			.send(testReminderObj)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a("object");
				res.body.should.have.property('id');
				dummyData();
			});
	});

	describe("Get all reminders for user (Success)", () => {
		it("it should get all reminders for seeded user", (dummyData) => {
			doRequest
				.get(uriReminder(2))
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					(res.body[0]).should.have.all.deep.keys("id", "title", "description", "created");
					(res.body[0]).title.should.equal(dummyRemTitle);
					(res.body[0]).description.should.equal(dummyRemDesc);
					dummyData();
				});
		});
	});

	describe("Get reminder for user with search (Success)", () => {
		it("it should get a reminder for the user where title = '" + dummyRemTitle + "'", (dummyData) => {
			doRequest
				.get(uriReminder(2) + "?title=" + dummyRemTitle)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					(res.body[0]).should.have.all.deep.keys("id", "title", "description", "created");
					(res.body[0]).title.should.equal(dummyRemTitle);
					dummyData();
				});
		});
	});

	describe("Get reminder for user with search (Failure)", () => {
		it("it should NOT get a reminder for the user where title = 'No Title'", (dummyData) => {
			doRequest
				.get(uriReminder(2) + "?title=No Title")
				.end((err, res) => {
					res.should.have.status(404);
					dummyData();
				});
		});
	});

	describe("Get all reminders for user (Failure)", () => {
		it("it should NOT get reminders. User with ID 0 does NOT exist", (dummyData) => {
			doRequest
				.get(uriReminder(0))
				.end((err, res) => {
					res.should.have.status(404);
					dummyData();
				});
		});
	});

	describe("Get reminder for user (Success)", () => {
		it("it should get a reminder for a user with ID", (dummyData) => {
			doRequest
				.get(uriReminder(2, 1))
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a("object");
					res.body.should.have.all.deep.keys("id", "title", "description", "created");
					res.body.title.should.equal(dummyRemTitle);
					res.body.description.should.equal(dummyRemDesc);
					dummyData();
				});
		});
	});

	describe("Get reminder for user (Failure)", () => {
		it("it should NOT get a reminder with ID 0", (dummyData) => {
			doRequest
				.get(uriReminder(2, 0))
				.end((err, res) => {
					res.should.have.status(404);
					dummyData();
				});
		});
	});

	describe("Get reminder for user (Failure)", () => {
		it("it should NOT get a reminder. User with ID 0 does NOT exist", (dummyData) => {
			doRequest
				.get(uriReminder(0,0))
				.end((err, res) => {
					res.should.have.status(404);
					dummyData();
				});
		});
	});

	describe("Create a reminder (Success)", () => {
		it("it should create a reminder", (done) => {
			doRequest
				.post(uriReminder(2))
				.send(testReminderObj)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a("object");
					res.body.should.have.property('id');
					done();
				});
		});
	});

	describe("Create a reminder (Failure)", () => {
		it("it should NOT create a reminder. No data sent", (done) => {
			doRequest
				.post(uriReminder(2))
				.send({})
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
	});

	describe("Create a reminder (Failure)", () => {
		it("it should NOT create a reminder. User with ID 0 does NOT exist", (done) => {
			doRequest
				.post(uriReminder(0))
				.send(testReminderObj)
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
	});

	describe("Delete a reminder (Success)", () => {
		it("it should delete the reminder for the user", (dummyData) => {
			doRequest
				.delete(uriReminder(2,1))
				.end((err, res) => {
					res.should.have.status(204);
					dummyData();
				});
		});
	});

	describe("Delete a reminder (Failure)", () => {
		it("it should NOT delete the reminder. Reminder with ID 0 does NOT exist", (dummyData) => {
			doRequest
				.delete(uriReminder(2, 0))
				.end((err, res) => {
					res.should.have.status(404);
					dummyData();
				});
		});
	});

	describe("Delete a reminder (Failure)", () => {
		it("it should NOT delete the reminder. User with ID 0 does NOT exist", (dummyData) => {
			doRequest
				.delete(uriReminder(0,1))
				.end((err, res) => {
					res.should.have.status(404);
					dummyData();
				});
		});
	});

	describe("Delete a reminder (Failure)", () => {
		it("it should NOT delete the reminder. There are no reminders for the user", (dummyData) => {
			doRequest
				.delete(uriReminder(2,1))
				.end((err, res) => {
					res.should.have.status(404);
					dummyData();
				});
		});
	});

	describe("Delete reminders (Failure)", () => {
		it("it should NOT delete all reminders. There are no reminders for the user", (dummyData) => {
			doRequest
				.delete(uriReminder(1))
				.end((err, res) => {
					res.should.have.status(404);
					dummyData();
				});
		});
	});

	describe("Delete reminders (Failure)", () => {
		it("it should NOT delete all reminders. User with ID 0 does NOT exist", (dummyData) => {
			doRequest
				.delete(uriReminder(0))
				.end((err, res) => {
					res.should.have.status(404);
					dummyData();
				});
		});
	});

	describe("Delete reminders (Success)", () => {
		it("it should delete all reminders for the user", (dummyData) => {
			doRequest
				.delete(uriReminder(2))
				.end((err, res) => {
					res.should.have.status(204);
					dummyData();
				});
		});
	});
});
/**************************/
/*** Test Reminders END ***/
/**************************/