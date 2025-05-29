import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import Header from "../pages/Header";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [email, setEmail] = useState("");
  const [plainPassword, setPlainPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        const res = await axios.get(`http://localhost:8080/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setEmail(res.data.email);
      } catch (err) {
        setErrorMessage("Nie udało się pobrać danych użytkownika.");
      }
    };

    fetchUser();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await axios.patch(
        `http://localhost:8080/api/users/${userId}`,
        {
          email,
          ...(plainPassword && { plainPassword }),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/merge-patch+json",
          },
        }
      );

      setSuccessMessage("Zapisano zmiany.");
      setPlainPassword("");
    } catch (err) {
      setErrorMessage("Błąd przy aktualizacji danych.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: 4, py: 2, height: '100vh', overflow: 'hidden' }}>
        <Header />
        <Box sx={{ mb: 2 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/library")}
                sx={{ textTransform: "none" }}
            >
           Powrót do Biblioteki
            </Button>
        </Box>
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                flexGrow: 1,
                p: 4,
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 500,
                    backgroundColor: "white",
                    borderRadius: 2,
                    p: 4,
                    boxShadow: 3,
             }}
            >    
                <Typography variant="h5" gutterBottom>
                     Profil użytkownika
                </Typography>

                 {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                 {successMessage && <Alert severity="success">{successMessage}</Alert>}

                <Box component="form" onSubmit={handleSubmit} mt={3}>
                    <TextField
                        fullWidth
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Nowe hasło"
                        type="password"
                        value={plainPassword}
                        onChange={(e) => setPlainPassword(e.target.value)}
                        margin="normal"
                        helperText="Zostaw puste, jeśli nie chcesz zmieniać hasła"
                    />
                    <Box mt={2}>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : "Zapisz zmiany"}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
  );
};

export default Profile;
