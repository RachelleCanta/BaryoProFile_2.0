import React, { useState, useEffect, useContext } from "react";
import { ArrowRight } from "lucide-react";
import "../styles/FinalLanding.css";
import { initializeUsers } from "../utils/userManager";
import axios from "axios";
import axiosInstance from "../axios";
import { UserContext } from "../contexts/userContext.js";
import { toast } from "react-toastify";

function NewLanding({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
  });
  const { setCurrentUser } = useContext(UserContext);

  const [showPasswords, setShowPasswords] = useState({
    regPass: false,
    regConfirmPass: false,
    loginPass: false,
  });

  useEffect(() => {
    initializeUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleShowingPasswords = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      // Signup logic remains the same
      if (formData.password !== formData.confirmPassword) {
        toast.warning("Passwords do not match!");
        return;
      }

      try {
        let url = "http://localhost:8080/api/users";

        let response = await axios.post(url, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: "user",
        });

        if (response.data.success === true) {
          toast.success(
            "Registration successful! Wait for admin's approval to login"
          );

          await axiosInstance.post("/system-logs", {
            action: "Create",
            module: "User Management",
            user: response.data.user.id, // Ensures proper formatting
            details: `User ${formData.username} was registered and is pending admin's approval`,
          });

          setFormData({
            username: "",
            password: "",
            email: "",
            confirmPassword: "",
          });

          alert("S");
        }
      } catch (error) {
        toast.error(error.response.data.message);
        console.log(error.response.data.message);
        setFormData({
          username: "",
          password: "",
          email: "",
          confirmPassword: "",
        });

        alert("E");
      }
    } else {
      // Login logic remains the same
      try {
        let url = "http://localhost:8080/api/users/login";

        let response = await axios.post(url, {
          email: formData.email,
          password: formData.password,
        });

        if (response.data.success === true) {
          if (response.data.user.status === "pending") {
            await axiosInstance.post("/system-logs", {
              action: "LOGIN_FAILED",
              module: "Authentication - Pending Account",
              user:
                response.data.user.id ||
                JSON.parse(localStorage.getItem("userId")), // Ensures proper formatting
              details: `User ${response.data.user.username} tries to login their pending account`,
            });
            toast.info("Your account is pending approval");
            return;
          }

          console.log(response.data.user);
          setCurrentUser(response.data.user);

          localStorage.setItem("role", JSON.stringify(response.data.user.role));
          localStorage.setItem("userId", JSON.stringify(response.data.user.id));
          await axiosInstance.post("/system-logs", {
            action: "Login",
            module: "Authentication",
            user:
              response.data.user.id ||
              JSON.parse(localStorage.getItem("userId")), // Ensures proper formatting
            details: `User ${response.data.user.username} has logged in`,
          });
          toast.success("Logged In Successfully!");
          onLogin(response.data.user);
        }
      } catch (error) {
        toast.error("Invalid User Credentials!");
      }
    }
  };

  return (
    <div className="landing-page split-layout">
      {/* Left side - Blue column with logo and content */}
      <div className="left-side">
        <div className="left-content">
          <img
            src="/images/system-logo.png"
            alt="System Logo"
            className="system-logo"
          />
          <div className="content-text">
            <p>"Streamlining Barangay Records for Efficient Data Management"</p>
            {/* <p></p> */}
          </div>
          {/* <div className="logo-area">
            <img
              src="/images/system-logo.png"
              alt="System Logo"
              className="system-logo"
            />
          </div>
          <div className="content-text">
            <h1>Barangay Darasa Profiling System</h1>
            <p>
              Efficiently manage and track resident information for better
              community service. Experience seamless data management and
              improved service delivery.
            </p>
          </div> */}
        </div>
      </div>

      {/* Right side - White column with login form */}
      <div className="right-side">
        <div className="auth-form-container">
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={!isSignUp ? "auth-tab active" : "auth-tab"}
                onClick={() => {
                  setIsSignUp(false);
                  setFormData({
                    username: "",
                    password: "",
                    email: "",
                    confirmPassword: "",
                  });
                }}
              >
                Login
              </button>
              <button
                className={isSignUp ? "auth-tab active" : "auth-tab"}
                onClick={() => {
                  setIsSignUp(true);
                  setFormData({
                    username: "",
                    password: "",
                    email: "",
                    confirmPassword: "",
                  });
                }}
              >
                Sign Up
              </button>
            </div>

            {isSignUp ? (
              <div className="auth-content">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">
                      Password{" "}
                      <span
                        className="forgot-password fpr"
                        onClick={() => handleShowingPasswords("regPass")}
                      >
                        {showPasswords.regPass ? "Hide" : "Show"}
                      </span>
                    </label>
                    <input
                      type={showPasswords.regPass ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Confirm Password{" "}
                      <span
                        className="forgot-password fpr"
                        onClick={() => handleShowingPasswords("regConfirmPass")}
                      >
                        {showPasswords.regConfirmPass ? "Hide" : "Show"}
                      </span>
                    </label>
                    <input
                      type={showPasswords.regConfirmPass ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                    />
                  </div>

                  <button type="submit" className="auth-button">
                    Create Account
                  </button>
                </form>
              </div>
            ) : (
              <div className="auth-content">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="username">Email</label>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type={showPasswords.loginPass ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                    />
                    {/* <p className="show-pass">Show Password</p> */}
                  </div>

                  <div className="form-options">
                    <label className="checkbox-container">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      Remember me
                    </label>
                    <span
                      className="forgot-password"
                      onClick={() => handleShowingPasswords("loginPass")}
                    >
                      {/* Forgot Password? */}
                      {showPasswords.loginPass ? "Hide" : "Show"} Password
                    </span>
                  </div>

                  <button type="submit" className="auth-button">
                    Login
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewLanding;
