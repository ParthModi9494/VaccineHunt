
const express = require("express");
const app = express();
const path = require("path");
const mainRouter = require("./routes/main");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", mainRouter);

app.listen(port, () => {
  console.log(`Server started and listening on port ${port}...`);
});


