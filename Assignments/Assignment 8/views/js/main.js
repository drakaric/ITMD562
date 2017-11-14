/*********************************/
/***** Application Functions *****/
/*********************************/

// Danger alert type
function DangerAlertType() {
	return "alert-danger";
}

// Info alert type
function InfoAlertType() {
	return "alert-info";
}

// Success alert type
function SuccessAlertType() {
	return "alert-success";
}

// Warning alert type
function WarnAlertType() {
	return "alert-warning";
}

// Array of alert types
function AlertTypes() {
	var alertTypes = [];
	alertTypes.push(DangerAlertType);
	alertTypes.push(InfoAlertType);
	alertTypes.push(SuccessAlertType);
	alertTypes.push(WarnAlertType);
	return alertTypes;
}

// Show bootstrap alert
function showAlert(title, msg, alertType, callback) {
	// If an alert type is not specified, treat as info by default.
	if (alertType === undefined) alertType = InfoAlertType;

	// Identify the alert modal.
	var alertModal = $(document).find("#alertModal");
	var modalCloseBtn = alertModal.find(".modal-header button");
	var modalTitle = alertModal.find(".modal-title");
	var modalBody = alertModal.find(".modal-body");

	// Remove all other types first.
	for (var i = 0; i < AlertTypes.length; i++) {
		modalBody.removeClass(AlertTypes[i]);
	}

	// Add classes and information.
	modalBody.addClass(alertType);
	modalTitle.html(title);
	modalBody.html(msg);

	// Hide all other modals and display the modal alert.
	$(".modal").modal("hide");
	alertModal.modal("show");

	// If a callback is defined, set a click event, and a timer.
	if (callback !== undefined) {
		$(document).on("click", modalCloseBtn, function() {
			callback();
		});
		setInterval(function() {callback()}, 4000);
	}
}

/************************/
/***** Click Events *****/
/************************/

// Delete user
$(document).on("click", ".delete-user", function(e) {
	var title = "Delete User";
	var thisBtn = $(this);
	var userId = thisBtn.attr("id").split("-")[1];

	if (confirm("Are you sure you want to delete user with ID: " + userId + "?")) {
		$.ajax({
			type: "DELETE",
			url: "/users/" + userId,
			success: function(data) {
				showAlert(
					title,
					"User ID: " + userId + ", deleted.",
					SuccessAlertType,
					function() {window.top.location = ""}
				);
			}, error: function() {
				showAlert(
					title,
					"An error has occurred while trying to remove user with ID:" + userId,
					DangerAlertType
				);
			}
		});
	}
});

// Delete a single reminder for a user
$(document).on("click", ".delete-reminder", function(e) {
	var title = "Remove Reminder";
	var thisBtn = $(this);
	var reminderId = thisBtn.attr("data-id").split("-")[1];

	if (confirm("Are you sure you want to remove reminder with ID: " + reminderId + "?")) {
		$.ajax({
			type: "DELETE",
			url: "/users/" + globalUserId + "/reminders/" + reminderId,
			success: function(data) {
				showAlert(
					title,
					"Reminder ID: " + reminderId + ", deleted.",
					SuccessAlertType,
					function() {window.top.location = ""}
				);
			}, error: function() {
				showAlert(
					title,
					"An error has occurred while trying to remove reminder with ID:" + reminderId,
					DangerAlertType
				);
			}
		});
	}
});

// Delete reminders for a user
$(document).on("click", ".delete-reminders", function(e) {
	var title = "Remove Reminders";

	if (confirm("Are you sure you want to remove all reminders for user with ID: " + globalUserId + "?")) {
		$.ajax({
			type: "DELETE",
			url: "/users/" + globalUserId + "/reminders",
			success: function(data) {
				showAlert(
					title,
					"All reminders for user with ID: " + globalUserId + ", deleted.",
					SuccessAlertType,
					function() {window.top.location = ""}
				);
			}, error: function() {
				showAlert(
					title,
					"An error has occurred while trying to remove reminders.",
					DangerAlertType
				);
			}
		});
	}
});

// View reminders for a user
$(document).on("click", ".view-reminders", function(e) {
	var thisBtn = $(this);
	var userId = thisBtn.attr("id").split("-")[1];

	window.top.location = "/getUsers/" + userId + "/reminders";
});

/********************************/
/***** Submission Overrides *****/
/********************************/

// Search by user ID
$(document).on("submit", "form[name='searchUserById']", function(e) {
	e.preventDefault();
	var userId = parseInt($(this).find("input[name='userId']").val());

	if (isNaN(userId)) {
		showAlert(
			"Invalid User ID",
			"User IDs must be numeric!",
			DangerAlertType
		);
	} else {
		var URL = "/getUsers/" + userId;
		console.log("URL:" + URL);

		window.top.location = URL;
	}
});

// Search by user ID
$(document).on("submit", "form[name='findReminder']", function(e) {
	$("#findReminder").modal("hide");
	$(this).submit();
});

// Create a new Reminder
$(document).on("submit", "form[name='createReminder']", function(e) {
	e.preventDefault();
	var modalTitle = "Create Reminder";
	var title = $(this).find("input[name='title']").val();
	var desc = $(this).find("input[name='desc']").val();

	$.ajax({
		method: "POST",
		url: "/users/" + globalUserId + "/reminders",
		data: {"reminder": {"title": title, "description": desc}},
		success: function(data) {
			showAlert(
				modalTitle,
				"Reminder: " + title + ", created. Reminder ID: " + data.id,
				SuccessAlertType,
				function() {window.top.location = ""}
			);
		}, error: function() {
			showAlert(
				modalTitle,
				"An error has occurred while trying to create a new reminder.",
				DangerAlertType
			);
		}
	});
});

// Create a new User
$(document).on("submit", "form[name='createUser']", function(e) {
	e.preventDefault();
	var title = "Create User";
	var name = $(this).find("input[name='name']").val();
	var email = $(this).find("input[name='email']").val();

	$.ajax({
		method: "POST",
		url: "/users/",
		data: {"user": {"name": name, "email": email}},
		success: function(data) {
			showAlert(
				title,
				"User: " + name + ", created. User ID: " + data.id,
				SuccessAlertType,
				function() {window.top.location = ""}
			);
		}, error: function() {
			showAlert(
				title,
				"An error has occurred while trying to create a new user.",
				DangerAlertType
			);
		}
	});
});