require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Keep this from the other version, it's useful for parsing URL-encoded data

const userRoutes = require("./routes/users");
const preferenceRoutes = require("./routes/preferences");
const newsRoutes = require("./routes/news");

const PORT = process.env.PORT || 3000;  // Default to 3000 if PORT is not set
mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("connected to mongodb");
}).catch(err => {
    console.log("Error connecting to MongoDB:", err);
});

app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});

app.use(userRoutes);
app.use(preferenceRoutes);
app.use(newsRoutes);

module.exports = app;
