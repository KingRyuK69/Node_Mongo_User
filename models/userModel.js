const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
  },
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  phoneNo: {
    type: String,
    required: [true, "Please enter a phone number"],
  },
  panNo: {
    type: String,
    required: [true, "Please enter a PAN number"],
    default: "Verified",
  },
  GSTIN: {
    type: String,
    required: [true, "Please enter a GSTN number"],
  },
  provider: {
    type: String,
  },
  userStatus: {
    type: String,
  },
});

const Users = mongoose.model("user_login", LoginSchema);

module.exports = Users;
