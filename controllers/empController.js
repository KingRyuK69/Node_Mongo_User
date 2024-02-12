const Emp = require("../models/empModel");

// emp registration
const addEmp = async (req, res) => {
  // Extracting emp details from the request body and storing them in a 'data' object.
  const data = {
    emp_role: req.body.emp_role,
    user_id: req.body.user_id,
    salary: req.body.salary,
  };

  try {
    // Checking if a emp with the same email already exists in the database.
    const existingEmp = await Emp.findOne({ user_id: data.user_id });

    // If emp exists, return an error message.
    if (existingEmp) {
      return res.status(400).json({
        error: true,
        result: null,
        msg: "Emp already exists",
      });
    } else {
      // Create a new emp
      const emp = new Emp({
        user_id: req.body.user_id,
        emp_role: data.emp_role,
        salary: data.salary,
      });

      // Save the new emp to the database.
      await emp.save();

      // Return the emp data
      return res.status(200).json({
        error: false,
        result: emp,
        msg: "New Emp created successfully",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, result: null, message: error.message });
  }
};

//show all emp
const getAllEmp = async (req, res) => {
  try {
    const emp = await Emp.find({});
    res.status(200).json({ error: false, result: emp, msg: "All Emp Details" });
  } catch (error) {
    res.status(500).json({ error: true, result: null, msg: error.message });
  }
};

//update emp
const updateEmp = async (req, res) => {
  const data = {
    user_id: req.body.user_id,
    emp_role: req.body.emp_role,
    salary: req.body.salary,
  };
  try {
    const emp = await Emp.findOne({ user_id: data.user_id });
    if (emp) {
      emp.emp_role = data.emp_role;
      emp.salary = data.salary;

      await emp.save();

      return res.status(200).json({
        error: false,
        result: emp,
        msg: "Emp updated successfully",
      });
    } else {
      return res.status(400).json({
        error: true,
        result: null,
        msg: "Emp not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      result: null,
      msg: error.message,
    });
  }
};

module.exports = { addEmp, getAllEmp, updateEmp };
