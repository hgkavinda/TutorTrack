const mongoose = require("mongoose");
const dns = require("dns");

// Some Windows/network DNS resolvers refuse SRV queries used by mongodb+srv.
// Allow the DNS servers to be overridden with MONGO_DNS_SERVERS when needed.
dns.setServers(
  (process.env.MONGO_DNS_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean),
);

const connectDB = async () => {
  try {

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {

    console.error("Database connection failed:");
    console.error(error.message);

    process.exit(1);
  }
};

module.exports = connectDB;