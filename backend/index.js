require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./src/routes/api");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "백엔드 서버 가동중. " });
});

// Mount the API routes
app.use("/api", apiRoutes);

app.listen(port, () =>
  console.log(
    `Server up and running at http://localhost:${port}. Go check it out!`,
  ),
);
