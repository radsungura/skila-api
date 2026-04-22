require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToMongo, getDb } = require("./db");
const app = express();
const port = process.env.PORT || 4000

// app.use(cors({
//   origin: /http:\/\/rad-pc/
// }));

// Enable CORS for specific origins
const corsOptions = {
  origin: 'https://skila.vercel.app/', //  Allowed origin
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
// default but not secure, all origin 

// app.use(cors());
app.use(express.json());

// Attach DB once
app.use((req, res, next) => {
  try {
    req.db = getDb();
    next();
  } catch (err) {
    next(err);
  }
});

// Routes
app.use("/", require("./router/places"));
app.use("/", require("./router/providers"));

// Start server AFTER Mongo connects
connectToMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  });
