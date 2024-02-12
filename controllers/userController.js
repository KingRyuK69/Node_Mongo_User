const multer = require("multer");
const path = require("path");
const fs = require("fs");
const base64 = require("base64-img");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Users = require("../models/userModel");
const Emp = require("../models/empModel");

//user registration
const signup = async (req, res) => {
  // Extracting user details from the request body and storing them in a 'data' object.
  const data = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    phoneNo: req.body.phoneNo,
    userStatus: req.body.userStatus,
    GSTIN: req.body.GSTIN,
  };

  try {
    // Checking if a user with the same email already exists in the database.
    const existingUser = await Users.findOne({ email: data.email });

    // If user exists, return an error message.
    if (existingUser) {
      return res.status(400).json({
        error: true,
        result: null,
        msg: "User already exists",
      });
    } else {
      // If no user with the same email exists, hash the password.
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create a new user
      const user = new Users({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phoneNo: data.phoneNo,
        userStatus: data.userStatus,
        panNo: data.panNo,
        GSTIN: data.GSTIN,
      });

      // Save the new user to the database.
      await user.save();

      // Return the user data
      return res.status(200).json({
        error: false,
        result: user,
        msg: "New User created successfully",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, result: fail, message: error.msg });
  }
};

//show all users
const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get a single user by id
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await Users.findById(id);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//user login
const login = async (req, res) => {
  // Extracting email and password from the request body.
  const { email, password } = req.body;

  try {
    // Finding a user with the provided email in the database.
    const user = await Users.findOne({ email });

    // If no user is found, return an error response.
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare the provided password with the user's password.
    const isMatch = await bcrypt.compare(password, user.password);

    // If the passwords do not match, return an error response.
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.userStatus) {
      return res.status(403).json({ message: "User account is deactivated" });
    }

    // If the user's account is active and the passwords match, generate a JWT token for the user.
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token, message: "User authenticated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//update profile info
const updateProfile = async (req, res) => {
  try {
    // Update with new data
    const user = await Users.findByIdAndUpdate(req.userId, req.body, {
      new: true,
    });

    // If user not found, return 404 status code
    if (!user) {
      return res
        .status(404)
        .json({ error: true, result: null, msg: "User can't be found" });
    }

    // If user found and updated, return updated user
    res
      .status(200)
      .json({ error: false, result: user, msg: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: true, result: null, msg: error.message });
  }
};

//Middleware for verifying JWT token
const verifyToken = (req, res, next) => {
  // Get token from request headers
  const token = req.headers?.Authorization || req.headers?.authorization;
  // If no token provided, return 403 status code
  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  // Verify token with secret key in env
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // If error occurs during verification, return 500 status
      return res.status(500).json({ message: "Failed to authenticate token." });
    }

    // If token is valid, set userId from decoded token and proceed to next middleware
    req.userId = decoded.id;
    next();
  });
};

//deactivate - active user
const deactivateUser = async (req, res) => {
  //user id from request body
  const userId = req.userId;

  try {
    // Update user status to 'Inactive' in the database
    const result = await Users.updateOne(
      { _id: userId, userStatus: "Active" },
      { $set: { userStatus: "Inactive" } }
    );

    // If no user status was updated (i.e., no user was found with the given ID and status 'Active')
    if (result.nModified == 0) {
      return res.status(400).json({
        message: "User status not updated. Check if user ID is correct.",
      });
    } else {
      return res.status(200).json({
        message: "User status updated to 'Inactive'.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

//delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByIdAndDelete(id);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User can't be found with ID ${id}` });
    }

    res.status(200).json({ message: `User with ID ${id} has been deleted.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//upload Profile Image
const uploadFile = async (req, res) => {
  try {
    // If no file is attached in the request
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // If file is attached, send success response with file details
    res.status(200).json({ message: "Single File Uploaded", file: req.file });
  } catch (error) {
    // If any error occurs, send error response with error message
    res.status(500).json({ message: error.message });
  }
};

// Configure multer disk storage
const fileStorageEngine = multer.diskStorage({
  // Set destination directory for uploaded files
  destination: (req, file, cb) => {
    // 'cb' function needs to be called when destinantion directory is determined
    cb(null, "./images");
  },
  // Set filename for uploaded files
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

// Initialize multer with storage and file filter options
const upload = multer({
  storage: fileStorageEngine,
  // File filter function to validate file extension
  fileFilter: (req, file, cb) => {
    console.log(file.originalname);
    let ext = path.extname(file.originalname);
    console.log("ext", ext);
    // If file extension is not png, jpg, or jpeg, reject the file
    if (ext != ".png" && ext != ".jpg" && ext != ".jpeg") {
      req.fileValidationError = "Forbidden extension";
      return cb(null, false, req.fileValidationError);
    }
    cb(null, true);
  },
});

//get a file
const getFile = async (req, res) => {
  try {
    // Extract filename from request parameters
    const filename = req.params.filename;
    // Construct file path by joining 'images' directory and the filename
    const filePath = path.join("images", filename);

    // Check if file exists at the constructed file path
    if (fs.existsSync(filePath)) {
      res.status(200).download(filePath, filename);
    } else {
      throw new Error("File not found");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//encode base64 img
const encodeBase64Img = async (req, res) => {
  try {
    // Get the image from the request file
    const imagePath = req.file.path;
    // Encode the image to Base64
    const encodedImage = await base64.base64Sync(imagePath);

    // Send the encoded image as a response
    res.status(200).json({ base64Image: encodedImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//decode base64 img
const decodeBase64Img = async (req, res) => {
  try {
    // Get the Base64 string and filename from the request body
    const base64String = req.body.image;
    const filename = req.body.filename;

    // Decode the Base64 string to an image
    base64.img(
      base64String,
      "./uploads",
      filename,
      async function (err, filepath) {
        if (err) {
          throw new Error("Failed to save image");
        }
        // Convert the relative path to an absolute path
        const absolutePath = path.resolve(filepath);
        // Check if the file exists before sending it
        if (fs.existsSync(absolutePath)) {
          // If the file exists, send it as a response
          res.sendFile(absolutePath);
        } else {
          throw new Error("File not found");
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get decoded image
const getImage = async (req, res) => {
  try {
    // Get the filename from the request parameters
    const filename = req.params.filename;
    // Construct the file path by joining 'uploads' directory and the filename
    const filePath = path.join("uploads", filename);

    // Check if the file exists at the constructed file path
    if (fs.existsSync(filePath)) {
      // Get the filename from the request parameters
      res.status(200).download(filePath, filename);
    } else {
      throw new Error("File not found");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// get one user with the specified emp details
const getUserWithEmpDetails = async (req, res) => {
  try {
    const user = await Emp.findOne({ user_id: req.params.id }).populate(
      "user_id"
    );
    res.json({ error: false, result: user, msg: "User with Emp Details" });
  } catch (err) {
    res.status(500).json({ error: true, result: null, msg: err.message });
  }
};

// get all user with emp details only
const getUserEmpAll = async (req, res) => {
  try {
    const users = await Emp.find({}).populate("user_id");
    res.json({
      error: false,
      result: users,
      msg: "All Users with Emp Details",
    });
  } catch (err) {
    res.status(500).json({ error: true, result: null, msg: err.message });
  }
};

// get all user with emp details only with (aggregation) pipeline with sort in order
const getAllUsersWithEmpDetails = async (req, res) => {
  try {
    const users = await Emp.aggregate([
      {
        $lookup: {
          from: "user_logins",
          localField: "user_id",
          foreignField: "_id",
          as: "user_details",
        },
      },
      {
        $addFields: {
          employee_details: {
            _id: "$_id",
            user_id: "$user_id",
            emp_role: "$emp_role",
            salary: "$salary",
            // add other fields as needed
          },
        },
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          user_id: 0,
          emp_role: 0,
          salary: 0,
          "user_details.__v": 0,
          // exclude/include other fields as needed
        },
      },
      {
        $sort: {
          "user_details._id": -1, // sort by userDetails._id in descending order
        },
      },
    ]);
    res.json({
      error: false,
      result: users,
      msg: "All Users with Emp Details",
    });
  } catch (err) {
    res.status(500).json({ error: true, result: null, msg: err.message });
  }
};

// get every existing user details present with emp as well
const getUserEmpEvery = async (req, res) => {
  try {
    const users = await Users.find({});
    const usersWithEmpDetails = await Promise.all(
      users.map(async (user) => {
        const empDetails = await Emp.findOne({ user_id: user._id });
        return {
          userDetails: user,
          // ...user._doc,
          empDetails: empDetails || [],
        };
      })
    );
    res.json({
      error: false,
      result: usersWithEmpDetails,
      msg: "All Users with Emp Details",
    });
  } catch (err) {
    res.status(500).json({ error: true, result: null, msg: err.message });
  }
};

// get every existing user details present with emp as well with (aggregation) pipeline
const getEveryUsersWithEmpDetails = async (req, res) => {
  try {
    const usersWithEmpDetails = await Users.aggregate([
      {
        $match: {
          userStatus: "Active",
        },
      },
      {
        $lookup: {
          from: "emp_details",
          localField: "_id",
          foreignField: "user_id",
          as: "empDetails",
        },
      },
      {
        $addFields: {
          userDetails: {
            _id: "$_id",
            name: "$name",
            phoneNo: "$phoneNo",
            email: "$email",
            panNo: "$panNo",
            GSTIN: "$GSTIN",
            password: "$password",
            userStatus: "$userStatus",
          },
        },
      },
      {
        $project: {
          panNo: 0,
          GSTIN: 0,
          name: 0,
          __v: 0,
          _id: 0,
          email: 0,
          password: 0,
          phoneNo: 0,
          userStatus: 0,
          "empDetails.__v": 0, // exclude __v from empDetails
        },
      },
      {
        $project: {
          salary: "$_id", // rename _id to salary
          users: 1, // include users
          _id: 0, // exclude _id
        },
      },
      {
        $sort: {
          "userDetails._id": -1, // sort by userDetails._id in descending order
        },
      },
    ]);

    const totalUsers = await Users.countDocuments({ userStatus: "Active" });

    res.json({
      error: false,
      result: { usersWithEmpDetails, totalUsers },
      msg: "All Users with Emp Details",
    });
  } catch (err) {
    res.status(500).json({ error: true, result: null, msg: err.message });
  }
};

// get emp role with filter of a particular employee
const getEmpRole = async (req, res) => {
  try {
    const usersWithEmpDetails = await Users.aggregate([
      {
        $match: {
          userStatus: "Active",
        },
      },
      {
        $lookup: {
          from: "emp_details",
          localField: "_id",
          foreignField: "user_id",
          as: "empDetails",
          pipeline: [
            {
              $match: {
                emp_role: "Frontend Dev",
              },
            },
          ],
        },
      },
      {
        $match: {
          "empDetails.emp_role": "Frontend Dev",
        },
      },
      {
        $addFields: {
          userDetails: {
            _id: "$_id",
            name: "$name",
            phoneNo: "$phoneNo",
            email: "$email",
            panNo: "$panNo",
            GSTIN: "$GSTIN",
            password: "$password",
            userStatus: "$userStatus",
          },
        },
      },
      {
        $project: {
          panNo: 0,
          GSTIN: 0,
          name: 0,
          __v: 0,
          _id: 0,
          email: 0,
          password: 0,
          phoneNo: 0,
          userStatus: 0,
          "result.__v": 0, // exclude __v from result
        },
      },
      {
        $sort: {
          "userDetails._id": -1, // sort by userDetails._id in descending order
        },
      },
    ]);
    res.json({
      error: false,
      result: usersWithEmpDetails,
      msg: "All Users with Emp Details",
    });
  } catch (err) {
    res.status(500).json({ error: true, result: null, msg: err.message });
  }
};

// group employee with users wrt salary
const getUsersWithEmpSalary = async (req, res) => {
  try {
    const usersWithEmpDetails = await Users.aggregate([
      {
        $match: {
          userStatus: "Active",
        },
      },
      {
        $lookup: {
          from: "emp_details",
          localField: "_id",
          foreignField: "user_id",
          as: "empDetails",
        },
      },
      {
        $addFields: {
          userDetails: {
            _id: "$_id",
            name: "$name",
            phoneNo: "$phoneNo",
            email: "$email",
            panNo: "$panNo",
            GSTIN: "$GSTIN",
            password: "$password",
            userStatus: "$userStatus",
          },
        },
      },
      {
        $project: {
          panNo: 0,
          GSTIN: 0,
          name: 0,
          __v: 0,
          _id: 0,
          email: 0,
          password: 0,
          phoneNo: 0,
          userStatus: 0,
          "empDetails.__v": 0, // exclude __v from empDetails
        },
      },
      {
        $unwind: "$empDetails",
      },
      {
        $unwind: "$userDetails",
      },
      {
        $group: {
          _id: "$empDetails.salary",
          users: {
            $push: {
              _id: "$_id",
              empDetails: "$empDetails",
              userDetails: "$userDetails",
            },
          },
        },
      },
      {
        $project: {
          salary: "$_id", // rename _id to salary
          users: 1, // include users
          _id: 0, // exclude _id
        },
      },
      {
        $sort: {
          "userDetails._id": -1, // sort by userDetails._id in descending order
        },
      },
    ]);

    const totalUsers = await Users.countDocuments({ userStatus: "Active" });

    res.json({
      error: false,
      result: { usersWithEmpDetails, totalUsers },
      msg: "All Users with Emp Details",
    });
  } catch (err) {
    res.status(500).json({ error: true, result: null, msg: err.message });
  }
};

module.exports = {
  getUser,
  deleteUser,
  uploadFile,
  upload,
  getFile,
  encodeBase64Img,
  decodeBase64Img,
  getImage,
  signup,
  login,
  getAllUsers,
  verifyToken,
  updateProfile,
  deactivateUser,
  getUserWithEmpDetails,
  getAllUsersWithEmpDetails,
  getEveryUsersWithEmpDetails,
  getEmpRole,
  getUserEmpAll,
  getUserEmpEvery,
  getUsersWithEmpSalary,
};
