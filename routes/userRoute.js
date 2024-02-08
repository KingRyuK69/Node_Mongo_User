const express = require("express");
const {
  getUser,
  uploadFile,
  getFile,
  encodeBase64Img,
  decodeBase64Img,
  getImage,
  signup,
  login,
  getAllUsers,
  updateProfile,
  verifyToken,
  deactivateUser,
  deleteUser,
  getUserWithEmpDetails,
  getAllUsersWithEmpDetails,
  getEveryUsersWithEmpDetails,
} = require("../controllers/userController");

//add prod validation middleware
const { addUserValidation } = require("../validations/eValidate");

//add email validation middleware
const { addEmailValidation } = require("../validations/mailValidate");

//add PAN and GSTIN validation middleware
const {
  add_GSTIN_PanValidation,
} = require("../validations/pan_gstin_Validate");

//image upload middleware
const { upload } = require("../controllers/userController");

const router = express.Router();

//show all user details
router.get("/userinfo", getAllUsers);

//get a file
router.get("/get-file/:filename", getFile);

//upload a profile image
router.post("/single", upload.single("image"), uploadFile);

//encode img
router.post("/encode", upload.single("image"), encodeBase64Img);

//decode img
router.post("/decode", decodeBase64Img);

//show decoded image
router.post("/get-file/:filename", getImage);

//user signup
router.post("/signup", addEmailValidation, add_GSTIN_PanValidation, signup);

//check login info
router.post("/login", login);

//update user Prof
router.put("/updateProfile", verifyToken, updateProfile);

//deactivate user by id
router.put("/user_stat/deactivate", verifyToken, deactivateUser);

// get all user with emp details
router.get("/getAllUsersWithEmpDetails", getAllUsersWithEmpDetails);

// get every user with emp details even if they don't have emp details
router.get("/getEveryUsersWithEmpDetails", getEveryUsersWithEmpDetails);

//get a new user by id
router.get("/getUser/:id", getUser);

// get user with emp details
router.get("/getUserDetails/:id", getUserWithEmpDetails);

//delete a user
router.delete("/delete/:id", deleteUser);

module.exports = router;
