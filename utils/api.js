const axios = require("axios");

const api = axios.create({
  baseURL: `https://cdn-api.co-vin.in/api/v2/`,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
  },
});

module.exports = api;
