const {
  addEmp,
  getAllEmp,
  updateEmp,
} = require("../controllers/empController"); // emp controller

const router = require("express").Router();

router.post("/addEmp", addEmp); //emp add

router.get("/getAllEmp", getAllEmp); //emp get all

router.put("/updateEmp", updateEmp); //emp get

module.exports = router;
