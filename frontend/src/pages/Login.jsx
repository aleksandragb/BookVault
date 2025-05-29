import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:8080/api/login", {
        email,
        password,
      });
      console.log("Login response:", res.data);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      login(user);

      navigate("/library");
    } catch (err) {
      setError("Nieprawidłowy email lub hasło");
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Logowanie
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Hasło"
            type="password"
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Zaloguj się
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Jeśli nie masz jeszcze konta,{" "}
            <Link to="/register" style={{ color: "#1976d2", textDecoration: "underline" }}>
              Zarejestruj się!
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
