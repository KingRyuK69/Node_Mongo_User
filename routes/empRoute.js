const { addEmp, getAllEmp } = require("../controllers/empController"); // emp controller

const router = require("express").Router();

router.post("/addEmp", addEmp); //emp add

router.get("/getAllEmp", getAllEmp); //emp get all

module.exports = router;
