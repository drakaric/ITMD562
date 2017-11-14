module.exports = {
  "Testing ITMD562 - Assignment 8 by drakaric" : function (client) {
    // Verify page title
    client
      .url('http://localhost:5000/')
      .waitForElementVisible('body', 1000)
      .assert.title('ITMD 562 - Assignment 8');

    // Verify Create User button
    client
      .useXpath()
      .assert.containsText("//html/body/nav/div/div/ul/li/button", "Create User");

    // Click Create User and verify values
    client
      .click("//html/body/nav/div/div/ul/li/button")
      .pause(500);

    client
      .useXpath()
      .assert.containsText("//html/body/nav/div/div/ul/li/div/div/div/div[1]/h4", "Create a New User");

    client
      .useXpath()
      .assert.containsText("//html/body/nav/div/div/ul/li/div/div/div/div[2]/form/label[1]", "Name:");

    // Form submission to create a new user
    client
      .useXpath()
      .setValue("//html/body/nav/div/div/ul/li/div/div/div/div[2]/form/input[1]", "Daniel Rakaric");

    client
      .useXpath()
      .setValue("//html/body/nav/div/div/ul/li/div/div/div/div[2]/form/input[2]", "drakaric@iit.edu");

    client
      .useXpath()
      .click("//html/body/nav/div/div/ul/li/div/div/div/div[2]/form/button");

    client.end();
  }
}