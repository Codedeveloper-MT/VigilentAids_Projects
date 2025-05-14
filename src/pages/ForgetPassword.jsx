import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import axios from "axios";
import "../styles/LoginPage.css";

const ForgetPassword = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const speak = async (text) => {
    try {
      await TextToSpeech.speak({
        text,
        lang: "en-US",
        rate: 1.0,
        pitch: 1.0,
      });
    } catch (error) {
      console.error("TextToSpeech error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setPassword("");
    try {
      // Fetch user info from backend
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password: "dummy" // Password is required by your login API, but we ignore it here
      });
      // If login fails, try to fetch password directly (not secure for production)
      if (response.data && response.data.success) {
        setMessage("User found. Please enter the correct password to login.");
      } else {
        // Try to fetch password directly (for demonstration only)
        const userRes = await axios.get(`http://localhost:5000/api/user/${username}`);
        if (userRes.data && userRes.data.password) {
          setPassword(userRes.data.password);
          setMessage("Your password is: " + userRes.data.password);
          await speak("Your password is " + userRes.data.password);
        } else {
          setMessage("Username not found.");
          await speak("Username not found.");
        }
      }
    } catch (error) {
      // Try to fetch password directly (for demonstration only)
      try {
        const userRes = await axios.get(`http://localhost:5000/api/user/${username}`);
        if (userRes.data && userRes.data.password) {
          setPassword(userRes.data.password);
          setMessage("Your password is: " + userRes.data.password);
          await speak("Your password is " + userRes.data.password);
        } else {
          setMessage("Username not found.");
          await speak("Username not found.");
        }
      } catch (err) {
        setMessage("Username not found.");
        await speak("Username not found.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Forgot Password</h2>
        {message && <p className="message">{message}</p>}
        {password && (
          <div style={{ marginBottom: "1rem", color: "#00bcd4", fontWeight: "bold" }}>
            Password: {password}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <button type="submit">Show Password</button>
          <button type="button" onClick={() => navigate("/login")}>
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;