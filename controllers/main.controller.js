const moment = require("moment");
const api = require("../utils/api");

exports.loadHome = (req, res, next) => {
  const searchType = req.query.type;
  if (searchType === "pincode") {
    res.render("home", { type: "pincode" });
  } else if (searchType === "district") {
    res.render("home", { type: "district" });
  } else {
    res.render("home", { type: "pincode" });
  }
};

exports.postSearch = (req, res, next) => {
  const searchType = req.query.type;
  if (searchType === "pincode") {
    const pincode = req.body.pincode;
    const ageGroup = +req.body.ageGroup;
    fetchData(pincode, ageGroup).then((centers) => {
      res.render("slotsList", { type: "pincode", centers: centers });
    });
  } else if (searchType === "district") {
    res.render("slotsList", { type: "district" });
  } else {
    res.render("home", { type: null });
  }
};

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
            min_age_limit: session.min_age_limit,
            vaccine: session.vaccine,
            date: session.date,
            name: center.name,
            address: center.address,
            district_name: center.district_name,
            state_name: center.state_name,
            pincode: center.pincode,
            fee_type: center.fee_type,
            date: session.date,
          });
        }
      }
    }

    const groupByDate = availableSlots.reduce(function (r, a) {
      r[a.date] = r[a.date] || [];
      r[a.date].push(a);
      return r;
    }, Object.create(null));

    const centersByDate = Object.keys(groupByDate).map((date) => {
      return {
        date: moment(date,"DD-MM-YYYY").format("DD MMMM, dddd"),
        details: groupByDate[date],
        totalSlots: groupByDate[date].reduce((acc, val) => {
          return acc + val.available_capacity;
        }, 0),
      };
    });

    console.log(centersByDate);
    return centersByDate;
  } catch (error) {
    console.log("Error occured : ", error);
    return [];
  }
};
