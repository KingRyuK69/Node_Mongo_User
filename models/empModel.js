const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user_login",
    required: [true, "Please enter a id"],
  },
  emp_role: {
    type: String,
    required: [true, "Please enter a role"],
  },
});

const Emp = mongoose.model("emp_detail", EmployeeSchema);

module.exports = Emp;
