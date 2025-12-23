// db.js (Updated for Kubernetes)
const mongoose = require("mongoose");

module.exports = async () => {
  try {
    const connectionParams = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    const useDBAuth = process.env.USE_DB_AUTH === 'true';
    if (useDBAuth) {
      connectionParams.auth = {
        username: process.env.MONGO_USERNAME,
        password: process.env.MONGO_PASSWORD
      };
      connectionParams.authSource = 'admin';          // Important!
    }

    const connStr = process.env.MONGO_CONN_STR;
    console.log('Connecting to:', connStr.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(connStr, connectionParams);
    console.log("Connected to MongoDB successfully!");

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
