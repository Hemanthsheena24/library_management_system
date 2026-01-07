const dotenv = require("dotenv");
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = require("./src/app");
const connectDB = require("./src/config/db");
const bcrypt = require("bcryptjs");
const Admin = require("./src/models/Admin");

const PORT = process.env.PORT || 5000;

// Seed default admin credentials
const seedDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@library.com" });
    
    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await Admin.create({
      email: "admin@library.com",
      password: hashedPassword,
    });

    console.log("✓ Default admin created: admin@library.com / admin123");
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  }
};

// Start server only after DB connection
const startServer = async () => {
  try {
    await connectDB();
    
    // Seed admin user on startup
    await seedDefaultAdmin();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
