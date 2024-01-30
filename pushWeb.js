const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const { fail } = require("assert");
const path = require("path");

const app = express();
require("colors");

// Set the static files directory to 'client' in the current directory
app.use(express.static(path.join(__dirname, "client")));

app.use(bodyParser.json());

const publicVapidKey =
  "BCtRdFGgDpPd0jRWIENJEhuhDcP3nu8izpEatoFHuTjAIGVk3DYL5Ww32ImJNvbWu9wE1O8tYFwVLccQ_w3zw5k";

const privateVapidKey = "jTKmHxRwN8GWLkPQTG_T75YwElaVkGAVThPr-UA5dwM";

// Set the VAPID details for the web-push library
webpush.setVapidDetails(
  "mailto:sohom.neogi@shyamsteel.com",
  publicVapidKey,
  privateVapidKey
);

// Define the /subscribe route for receiving push subscriptions
app.post("/subscribe", (req, res) => {
  // Get the pushSubscription object from the request body
  const subscription = req.body;

  //send 201 status - resource created
  res.status(201).json({
    error: false,
    result: "Push Notification Sent",
    msg: "Created Successfully",
  });

  //create a payload(optional)
  const payload = JSON.stringify({ title: "Push Test" });

  //pass object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch((err) => console.error(err));
  res.status(400).json({
    error: true,
    result: fail,
    msg: "Unsuccesfull",
  });
});

const port = 5000;

app.listen(port, () =>
  console.log(`Server started on port ${port}`.bold.underline.bgCyan)
);
