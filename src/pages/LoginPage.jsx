import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { App } from "@capacitor/app";
import { Storage } from "@capacitor/storage";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init();
    speak("You are on the login page. Please enter your username and password.");

   
    const loadStoredCredentials = async () => {
      const { value } = await Storage.get({ key: "loginData" });
      if (value) {
        const saved = JSON.parse(value);
        setFormData(saved);
      }
    };
    loadStoredCredentials();

    const backHandler = App.addListener("backButton", () => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        speak("Exiting the app.");
        App.exitApp();
      }
    });

    return () => {
      backHandler.remove();
    };
  }, []);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      const errorMessage = "Please fill in both username and password.";
      setMessage(errorMessage);
      await speak(errorMessage);
      return;
    }
    await Storage.set({
      key: "loginData",
      value: JSON.stringify(formData),
    });

    try {
      const response = await axios.post("http://localhost:5000/api/login", formData);
      if (response.data.success) {
        const successMessage = "Login successful! Redirecting to the Home page.";
        setMessage(successMessage);
        await speak(successMessage);
        localStorage.setItem("loggedInUsername", formData.username);
        setTimeout(() => {
          navigate("/screenPage");
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Invalid username or password.";
      setMessage(errorMessage);
      await speak(errorMessage);
    }
  };

  const handleNavigateToRegister = async () => {
    await speak("Navigating to the Create account page.");
    navigate("/register");
  };

  const handleNavigateToForgotPassword = async () => {
    await speak("Navigating to the forgot password page.");
    navigate("/forgot-password");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>VigilentAids</h2>
        {message && <p>{message}</p>}

        <form onSubmit={handleLogin}>
          <div>
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => speak("Please enter your username.")}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => speak("Please enter your password.")}
              required
            />
          </div>

          <button type="submit">Login</button>

          <button type="button" onClick={handleNavigateToForgotPassword}>
            Forgot Password?
          </button>

          <button type="button" onClick={handleNavigateToRegister}>
            Create New Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
