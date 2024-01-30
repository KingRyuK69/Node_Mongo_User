// Importing the fcm-node module to send push notifications
const FCM = require("fcm-node");
require("dotenv").config();

const serverKey = process.env.SERVER_KEY;
const deviceToken = process.env.DEVICE_TOKEN;

// Creating a new FCM instance with the server key
const fcm = new FCM(serverKey);

// Defining the message to be sent
const message = {
  to: deviceToken, // The device token to which the message will be sent
  notification: {
    title: "Push Notification by Sohom",
    body: "Hello there, Sohom here",
  },
};

// Sending the message
fcm.send(message, function (err, res) {
  if (err) {
    console.log("Error sending message:", err);
  } else {
    console.log("Message sent successfully:", res);
  }
});
