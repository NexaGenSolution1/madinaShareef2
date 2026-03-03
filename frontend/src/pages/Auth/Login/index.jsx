import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { toast } from "react-toastify";
import styles from "./Login.module.css";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [autoLoginTriggered, setAutoLoginTriggered] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const performLogin = async (payload) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", {
        email: payload.email.trim(),
        password: payload.password,
      });
      if (res.status === 200 && res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem("frontend_token", token);
        localStorage.setItem("frontend_user", JSON.stringify(user));
        toast.success("Login successful!");
        if (user.role === "Admin") {
          window.location.href = "/admin-portal/";
        } else {
          if (onLogin) onLogin(user);
        }
      }
    } catch (error) {
      if (error.response) {
        const msg = error.response.data.message || "Login failed";
        toast.error(msg);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    performLogin(formData);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefills = {
      email: params.get("email") || "",
      password: params.get("password") || "",
    };
    const shouldAuto =
      (params.get("auto") || params.get("autoLogin")) === "true";
    if (prefills.email || prefills.password) {
      setFormData((prev) => ({ ...prev, ...prefills }));
    }
    if (
      shouldAuto &&
      prefills.email &&
      prefills.password &&
      !autoLoginTriggered
    ) {
      setAutoLoginTriggered(true);
      performLogin(prefills);
    }
  }, [autoLoginTriggered]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await axiosInstance.post("/auth/forgot-password", {
        email: forgotEmail.trim(),
      });
      if (res.data?.success) {
        toast.success("Password reset link sent to your email.");
        setShowForgot(false);
      } else {
        toast.error(res.data?.message || "Failed to send reset link");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          {/* LEFT PANEL */}
          <div className={styles.leftPanel}>
            <h1>Welcome Back</h1>

            <div className={styles.companyCards}>
              <div className={styles.companyCard}>
                <div className={styles.companyName}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M3 21V7l9-4 9 4v14H3zm2-2h14V8.5l-7-3.1L5 8.5V19zm3-3h2v-4H8v4zm4 0h2v-4h-2v4zm4 0h2v-4h-2v4z" />
                  </svg>
                  Brothers International Travels
                </div>
                <div className={styles.companyDetail}>Licence: PR-3919</div>
              </div>
              <div className={styles.companyCard}>
                <div className={styles.companyName}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" />
                  </svg>
                  Barand Care 360 International
                </div>
                <div className={styles.companyDetail}>
                  Overseas Employment Promoters
                  <br />
                  Licence: Nill
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoBlock}>
                <h4>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                  </svg>
                  Phone
                </h4>
                <p>
                  0932 412499
                  <br />
                  0347 8885551
                  <br />
                </p>
              </div>
              <div className={styles.infoBlock}>
                <h4>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Email
                </h4>
                <p>
                  brothersit369@gmail.com
                  <br />
                  aizazbtk@gmail.com
                </p>
              </div>
            </div>

            <div className={styles.addressSection}>
              <h4>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Address
              </h4>
              <p>1st Floor, City Center Plaza, Downtown Dubai, UAE</p>
            </div>

            <div className={styles.directorCard}>
              <div className={styles.directorName}>Aizaz Ur Rahman</div>
              <div className={styles.directorTitle}>Managing Director</div>
            </div>

            <div className={styles.signupLink}>
              Don't have an account? <a href="/auth/register">Sign Up</a>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className={styles.rightPanel}>
            <div className={styles.lockIconWrap}>
              <svg viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
            <h2>Sign In</h2>

            <form
              onSubmit={handleSubmit}
              style={{ width: "100%" }}
              autoComplete="off"
            >
              <div className={styles.formGroup}>
                <label>
                  Email Address <span>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder=""
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Password <span>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className={styles.forgotLink}>
                <button type="button" onClick={() => setShowForgot(true)}>
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className={styles.signinBtn}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showForgot && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowForgot(false)}
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowForgot(false)}
            >
              ×
            </button>
            <h3>Write your email address.</h3>
            <form
              onSubmit={handleForgotPassword}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                className={styles.signinBtn}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "Send Me Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
