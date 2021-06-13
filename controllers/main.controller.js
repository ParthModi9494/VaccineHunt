const moment = require("moment");
const api = require("../utils/api");
const today = moment().format("DD-MM-YYYY");

exports.loadHome = (req, res, next) => {
  const searchType = req.query.type;
  if (searchType === "pincode") {
    res.render("home", { type: "pincode" });
  } else if (searchType === "district") {
    fetchStates()
      .then((states) => {
        res.render("home", {
          type: "district",
          states: states,
          districts: [],
          selectedState: null,
          selectedDistrict: null,
        });
      })
      .catch((error) => {
        res.render("home", { type: "district", states: [], error: error });
      });
  } else {
    res.render("home", { type: "pincode" });
  }
};

exports.postSearch = async (req, res, next) => {
  const searchType = req.query.type;

  if (searchType === "pincode") {
    const pincode = req.body.pincode;
    const ageGroup = +req.body.ageGroup;
    fetchSlotsByPincode(pincode, ageGroup).then((centers) => {
      res.render("slotsList", { type: "pincode", centers: centers });
    });
  } else if (searchType === "district") {
    const state_id = req.body.state_id;
    const district_id = req.body.district_id;
    const ageGroup = +req.body.ageGroup;

    try {
      const centers = await fetchSlotByDistrict(district_id, ageGroup);
      const states = await fetchStates();
      const districts = await fetchDistricts(state_id);

      res.render("slotsList", {
        type: "district",
        centers: centers,
        states: states,
        districts: districts,
        selectedState: state_id,
        selectedDistrict: district_id,
      });
    } catch (error) {}
  } else {
    res.render("home", { type: null });
  }
};

fetchSlotByDistrict = async (district_id, ageGroup) => {
  try {
    const response = await api.get(
      `appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${today}`
    );
    const centers = (response && response.data && response.data.centers) || [];

    if (!centers.length) {
      return [];
    }

    return groupCenterData(centers, ageGroup);
  } catch (error) {}
};

fetchSlotsByPincode = async (pin, ageGroup) => {
  try {
    const response = await api.get(
      `/appointment/sessions/public/calendarByPin?pincode=${pin}&date=${today}`
    );
    const centers = (response && response.data && response.data.centers) || [];

    if (!centers.length) {
      return [];
    }
    return groupCenterData(centers, ageGroup);
  } catch (error) {
    console.log("Error occured : ", error);
    return [];
  }
};

fetchStates = async () => {
  try {
    const state_response = await api.get("/admin/location/states");
    if (state_response && state_response.data && state_response.data.states) {
      return state_response.data.states;
    } else {
      return [];
    }
  } catch (error) {
    return error;
  }
};

fetchDistricts = async (state_id) => {
  try {
    const districts_response = await api.get(
      `/admin/location/districts/${state_id}`
    );
    if (districts_response && districts_response.data && districts_response.data.districts) {
      return districts_response.data.districts;
    } else {
      return [];
    }
  } catch (error) {
    return error;
  }
};

groupCenterData = (centers, ageGroup) => {
  const availableSlots = [];

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
      date: moment(date, "DD-MM-YYYY").format("DD MMMM, dddd"),
      details: groupByDate[date],
      totalSlots: groupByDate[date].reduce((acc, val) => {
        return acc + val.available_capacity;
      }, 0),
    };
  });

  return centersByDate;
};
