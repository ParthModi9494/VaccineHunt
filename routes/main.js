const express = require("express");
const router = express.Router();
const moment = require("moment");
const api = require("../utils/api");
const baseURL = "https://cdn-api.co-vin.in/api/v2/";

router.get("/", (req, res, next) => {
  const searchType = req.query.type;
  if (searchType === "pincode") {
    res.render("home", { type: "pincode" });
  } else if (searchType === "district") {
    res.render("home", { type: "district" });
  } else {
    res.render("home", { type: "pincode" });
  }
});

router.post("/search", (req, res, next) => {
  const searchType = req.query.type;
  if (searchType === "pincode") {
    const pincode = req.body.pincode;
    const ageGroup = +req.body.ageGroup;
    fetchData(pincode, ageGroup).then((slots) => {
      res.render("slotsList", { type: "pincode", slots: slots });
    });
  } else if (searchType === "district") {
    res.render("slotsList", { type: "district" });
  } else {
    res.render("home", { type: null });
  }
});

fetchData = async (pin, ageGroup) => {
  const today = moment().format("DD-MM-YYYY");
  const availableSlots = [];
  try {
    const response = await api.get(
      `appointment/sessions/public/calendarByPin?pincode=${pin}&date=${today}`
    );
    const centers = (response && response.data && response.data.centers) || [];

    if (!centers.length) {
      return [];
    }

    for (const center of centers) {
      const sessions = center.sessions || [];
      for (const session of sessions) {
        if (
          session.available_capacity > 0 &&
          session.min_age_limit === ageGroup
        ) {
          availableSlots.push({
            available_capacity: session.available_capacity,
            date: session.date,
            center_name: center.name,
          });
        }
      }
    }
    return availableSlots;
  } catch (error) {
    console.log("Error occured : ", error);
    return [];
  }
};

module.exports = router;
