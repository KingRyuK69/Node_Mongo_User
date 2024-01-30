const express = require("express");
const User = require("../models/userModel");
const { check, validationResult } = require("express-validator");

exports.add_GSTIN_PanValidation = [
  check("GSTIN")
    .matches(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/)
    .withMessage("Invalid GSTIN number")
    .custom((GSTIN, { req }) => {
      const gstinPan = GSTIN.slice(2, 12);
      if (gstinPan !== req.body.panNo) {
        throw new Error("Credentials Wrong"); //check with the (2-12)th position in pan to match
      }
      return true;
    }),
  check("panNo")
    .matches(/^[A-Z]{5}\d{4}[A-Z]{1}$/)
    .withMessage("Invalid PAN number")
    .custom(async (panNo) => {
      // console.log(`Checking PAN number: ${panNo}`);
      const user = await User.findOne({ pan: panNo });
      // console.log(`User found: ${user}`);
      if (user) {
        throw new Error("PAN number already in use");
      }
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // // Check if GSTIN is defined
    // if (!req.body.GSTIN) {
    //   return res.status(400).json({ errors: [{ msg: "GSTIN is required" }] });
    // }

    // // Extract PAN from GSTIN
    // const gstinPan = req.body.GSTIN.slice(2, 12);
    // if (gstinPan !== req.body.panNo) {
    //   return res.status(400).json({
    //     errors: [{ msg: "PAN does not match with the PAN in GSTIN" }],
    //   });
    // }

    next();
  },
];
