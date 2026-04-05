const mongoose = require("mongoose");
const User = require("./src/models/User");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    const exists = await User.findOne({ email: "admin123@gmail.com" });
    if (!exists) {
      await User.create({
        name: "Super Admin",
        email: "admin123@gmail.com",
        password: "AdminPassword123",
        role: "admin",
      });
      console.log("Admin user created successfully.");
    } else {
      console.log("Admin user already exists.");
    }
    process.exit(0);
  })
  .catch(console.error);
