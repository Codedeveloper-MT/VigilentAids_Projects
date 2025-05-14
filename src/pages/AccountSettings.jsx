import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/RegisterPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { App } from "@capacitor/app";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import "aos/dist/aos.css";
import AOS from "aos";

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    country: "",
    cell_number: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("loggedInUsername");

  // Speak function: Capacitor TTS on mobile, browser fallback on web
  const speak = useCallback(async (text) => {
    if (window && window.Capacitor && window.Capacitor.isNativePlatform && TextToSpeech) {
      try {
        await TextToSpeech.speak({
          text,
          lang: "en-US",
          rate: 1.0,
          pitch: 1.0,
        });
      } catch (e) {
        // fallback to browser
        if ("speechSynthesis" in window) {
          const utterance = new window.SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.lang = "en-US";
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      }
    } else if ("speechSynthesis" in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Handle mobile hardware back button
  useEffect(() => {
    const handler = App.addListener("backButton", () => {
      speak("Going back to the main screen.");
      navigate("/screenPage");
    });
    return () => {
      handler.remove();
    };
  }, [navigate, speak]);

  // AOS animation
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user/${username}`);
        if (res.data) {
          setFormData({
            country: res.data.country || "",
            cell_number: res.data.cell_number || "",
            password: res.data.password || "",
          });
        }
      } catch (err) {
        setMessage("Could not load user info.");
        speak("Could not load user info.");
      }
    };
    if (username) fetchUser();
  }, [username, speak]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.put(`http://localhost:5000/api/user/${username}`, formData);
      setMessage(res.data.message || "Account updated!");
      speak("Account updated successfully.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Update failed.");
      speak("Failed to update account.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/user/${username}`);
      localStorage.removeItem("loggedInUsername");
      speak("Account deleted. Returning to home.");
      navigate("/");
    } catch (err) {
      setMessage("Failed to delete account.");
      speak("Failed to delete account.");
    }
    setLoading(false);
  };

  if (!username) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Account Settings</h2>
          <p>Please log in to manage your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box" data-aos="fade-up">
        <h2>Account Settings</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <input
              id="country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              required
              placeholder="Country"
              onFocus={() => speak("Please enter your country.")}
            />
          </div>
          <div className="form-group">
            <input
              id="cell_number"
              name="cell_number"
              type="tel"
              value={formData.cell_number}
              onChange={handleChange}
              required
              placeholder="Phone Number"
              onFocus={() => speak("Please enter your phone number.")}
            />
          </div>
          <div className="form-group">
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
              onFocus={() => speak("Please enter your password.")}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            onFocus={() => speak("Update your account.")}
          >
            {loading ? "Updating..." : "Update Account"}
          </button>
        </form>
        <button
          type="button"
          style={{ background: "#b0bec5", color: "#0d1b2a", marginTop: "1rem" }}
          onClick={handleDelete}
          disabled={loading}
          onFocus={() => speak("Delete your account.")}
        >
          {loading ? "Processing..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;