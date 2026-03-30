import { useState } from "react";
import axios from "axios";

function Login({ setIsLoggedIn }) {
  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      alert("Fill all fields");
      return;
    }

    try {
      if (isRegister) {
        // 🔐 REGISTER
        await axios.post(
          "http://localhost:3001/api/auth/register",
          form
        );
        alert("Registered successfully! Now login.");
        setIsRegister(false);
      } else {
        // 🔐 LOGIN
        const res = await axios.post(
          "http://localhost:3001/api/auth/login",
          form
        );

        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          setIsLoggedIn(true);
        } else {
          alert("Invalid credentials");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", background: "#f4f6f9" }}
    >
      <div className="card p-4 shadow" style={{ width: "350px" }}>
        <h3 className="text-center mb-4">
          {isRegister ? "Register" : "Login"}
        </h3>

        <input
          className="form-control mb-3"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button className="btn btn-primary w-100" onClick={handleSubmit}>
          {isRegister ? "Register" : "Login"}
        </button>

        {/* 🔥 TOGGLE TEXT */}
        <p className="text-center mt-3">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => setIsRegister(false)}
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => setIsRegister(true)}
              >
                Register
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;