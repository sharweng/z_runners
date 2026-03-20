require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/db");

const PORT = process.env.PORT || 4000;

connectDatabase();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
