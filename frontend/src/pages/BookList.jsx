import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../pages/Header";

const BookList = () => {
  const [open, setOpen] = useState(false);
  const [book, setBook] = useState({
    title: "",
    author: "",
    description: "",
    rating: "",
    file: null,
  });
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/books", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("GET /api/books response", res.data);

        if (Array.isArray(res.data)) {
          setBooks(res.data);
        } else if (Array.isArray(res.data["hydra:member"])) {
          setBooks(res.data["hydra:member"]);
        } else {
          setBooks([]);
        }

      } catch (err) {
        console.error("Błąd przy pobieraniu książek:", err);
      }
    };

    fetchBooks();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setBook({ ...book, file: files[0] });
    } else {
      setBook({ ...book, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", book.title);
    formData.append("author", book.author);
    formData.append("description", book.description);
    formData.append("rating", book.rating);
    if (book.file) {
      formData.append("file", book.file);
    }

    try {
      const res = await axios.post("http://localhost:8080/api/books", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setBooks((prev) => (Array.isArray(prev) ? [...prev, res.data] : [res.data]));
      setOpen(false);
      setBook({
        title: "",
        author: "",
        description: "",
        rating: "",
        file: null,
      });
    } catch (err) {
      console.error("Błąd przy dodawaniu książki:", err);
      console.log("Błąd backendu:", err.response?.data);
    }
    console.log("Token:", localStorage.getItem("token"));

  };

  const filteredBooks = books
    .filter((b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
  });


  return (
    <Box sx={{ p: 4, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Header />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <TextField
          label="Szukaj"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ minWidth: 300, height: "40px" }}
        />
        <TextField
          select
          label="Sortuj według"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
          SelectProps={{ native: true }}
        >
          <option value="default">Domyślnie</option>
          <option value="title">Tytuł (A-Z)</option>
          <option value="date">Data dodania (najnowsze)</option>
        </TextField>

        <Button variant="contained" size="large" onClick={() => setOpen(true)}>
          Dodaj książkę
        </Button>
      </Box>


      <Grid container spacing={3}>
        {Array.isArray(filteredBooks) && filteredBooks.map((b) => (

          <Grid item key={b.id} xs={12} sm={6} md={4} lg={3}>
            <Card onClick={() => navigate(`/book/${b.id}`)} sx={{ cursor: "pointer" }}>
              <CardActionArea>
                {b.filePath && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`http://localhost:8080${b.filePath}`}
                    alt={b.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {b.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Autor: {b.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ocena: {b.rating}/10
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj książkę</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate>
            <TextField
              label="Tytuł"
              name="title"
              fullWidth
              margin="normal"
              value={book.title}
              onChange={handleChange}
              required
            />
            <TextField
              label="Autor"
              name="author"
              fullWidth
              margin="normal"
              value={book.author}
              onChange={handleChange}
              required
            />
            <TextField
              label="Opis"
              name="description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={book.description}
              onChange={handleChange}
            />
            <TextField
              label="Ocena"
              name="rating"
              type="number"
              inputProps={{ min: 1, max: 10 }}
              fullWidth
              margin="normal"
              value={book.rating}
              onChange={handleChange}
            />
            <input
              accept="image/*"
              type="file"
              name="file"
              onChange={handleChange}
              style={{ marginTop: 16 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Dodaj
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookList;
