const Users = require("../models/userModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadF = multer({ dest: "uploads/" });
const base64 = require("base64-img");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { fail } = require("assert");
require("dotenv").config();

//user registration
const signup = async (req, res) => {
  // Extracting user details from the request body and storing them in a 'data' object.
  const data = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    phoneNo: req.body.phoneNo,
    userStatus: req.body.userStatus,
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
        panNo: data.userStatus,
        GSTIN: data.userStatus,
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
      return res.status(404).json({ message: `User can't be found` });
    }

    // If user found and updated, return updated user
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
};