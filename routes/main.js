const express = require("express");
const router = express.Router();

const mainController = require("../controllers/main.controller");

router.get("/", mainController.loadHome);

router.post("/search", mainController.postSearch);

module.exports = router;
