const states = require("./utils/states.json");
const api = require("./utils/api");
const fs = require("fs");

states.forEach((state) => {
  api.get(`/admin/location/districts/${state.state_id}`).then((res) => {
    fs.writeFileSync(`./public/data/${state.state_id}.json`, JSON.stringify(res.data.districts));
  });
});
