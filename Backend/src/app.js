const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const healthRoutes = require("./routes/health.routes");
const apiRoutes = require("./routes/api.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", healthRoutes);
app.use("/api/v1", apiRoutes);
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({ message: "z_runners backend is running" });
});

module.exports = app;
