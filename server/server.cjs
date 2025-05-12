const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123Mp.#7",
  database: "vigilentaids_db",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database");
});

// Register API Endpoint
app.post("/api/register", async (req, res) => {
  const { username, password, cell_number, country } = req.body;

  if (!username || !password || !cell_number || !country) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = `INSERT INTO user (username, password, cell_number, country) VALUES (?, ?, ?, ?)`;
  db.execute(query, [username, password, cell_number, country], (err, results) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ error: "Error occurred while registering user." });
    }

    res.json({ success: true, message: "Account created successfully." });
  });
});

// Login API Endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  db.query("SELECT * FROM user WHERE username = ?", [username], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (password !== result[0].password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({ success: true, message: "Login successful" });
  });
});

// API Endpoint to Store Location Data
app.post("/api/location", (req, res) => {
  const { location_name, longitude, latitude, iduser } = req.body;

  if (!location_name || !longitude || !latitude || !iduser) {
    return res.status(400).json({ message: "All fields are required" });
  }

  console.log("Inserting location with data:", { location_name, longitude, latitude, iduser }); // Log the data being inserted

  const query = `
    INSERT INTO location (location_name, longitude, latitude, iduser)
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [location_name, longitude, latitude, iduser], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ message: "Error inserting location" });
    }
    res.status(201).json({ message: "Location saved successfully", locationID: result.insertId });
  });
});

// API Endpoint to Retrieve Location Data
app.get("/api/location/:id", (req, res) => {
  const locationID = req.params.id;

  const query = `
    SELECT * FROM location WHERE locationID = ?
  `;
  db.query(query, [locationID], (err, results) => {
    if (err) {
      console.error("Error fetching location data:", err);
      return res.status(500).json({ message: "Error fetching location data" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json(results[0]);
  });
});

// Function to Save Location
const saveLocation = async () => {
  if (!coordinates) {
    speak("Please wait while we get your location.", true);
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location_name: displayAddress,
        longitude: coordinates.lng,
        latitude: coordinates.lat,
        iduser: 1,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      speak("Location updated successfully.");
    } else {
      speak(data.message || "Failed to update location.");
    }
  } catch (error) {
    console.error("Error updating location:", error);
    speak("An error occurred while updating your location.");
  }
};

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
