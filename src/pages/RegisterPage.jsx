import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/RegisterPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    country: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init();
    speak("You are on the create account page. Please enter your personal details.");

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
  }, [navigate]);


  const speak = async (text) => {
    try {
      const platform = Capacitor.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        await TextToSpeech.speak({
          text,
          lang: 'en-US',
          rate: 1.0,
        });
      } else if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error in speak function:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        username: formData.username,
        password: formData.password,
        cell_number: formData.phone,
        country: formData.country,
      });

      if (response.data.success) {
        const successMessage = "Account created successfully! Please login.";
        setMessage(successMessage);
        await speak(successMessage);
        if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') {
          await Toast.show({ text: successMessage });
        }
        setFormData({
          username: "",
          phone: "",
          country: "",
          password: "",
        });
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "An error occurred during registration.";
      setMessage(errorMsg);
      await speak(errorMsg);
    }
  };

  const handleNavigateToLogin = () => {
    speak("Back to login screen");
    navigate("/login");
  };

  return (
    <div className="registration-container">
      <div className="form-container">
        <h2>Create an Account</h2>
        {message && <p className="message">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            onFocus={() => speak("Enter username")}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            onFocus={() => speak("Enter phone number")}
            required
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            onFocus={() => speak("Enter country")}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => speak("Enter password")}
            required
          />
          <button
            type="submit"
            onClick={() => speak("Creating account")}
            onFocus={() => speak("Create account")}
            className="register-btn"
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              speak("Back to login screen");
              handleNavigateToLogin();
            }}
            onFocus={() => speak("Back to login screen")}
            className="register-btn"
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
