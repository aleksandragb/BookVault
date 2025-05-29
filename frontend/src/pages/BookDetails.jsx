import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Header from "../pages/Header";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [editBookOpen, setEditBookOpen] = useState(false);
  const [editNoteOpen, setEditNoteOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    rating: "",
  });
  const [notes, setNotes] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [editContent, setEditContent] = useState("");


  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/books/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setBook(res.data);
      } catch (err) {
        console.error("Błąd przy pobieraniu książki:", err);
      }
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        rating: book.rating || "",
      });
    }
  }, [book]);

  useEffect(() => {
      const fetchNotes = async () => {
        try {
          const res = await axios.get("http://localhost:8080/api/notes", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const allNotes = res.data["hydra:member"] || res.data;
          const bookNotes = allNotes.filter((note) =>
            note.book.endsWith(`/books/${id}`)
          );
          setNotes(bookNotes);
        } catch (err) {
          console.error("Błąd przy pobieraniu notatek:", err);
        }
      };

      fetchNotes();
    }, [id]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditSubmit = async () => {
    try {
      const dataToSend = {
        ...formData,
        rating: formData.rating ? Number(formData.rating) : null,
      };
  
      await axios.patch(
        `http://localhost:8080/api/books/${book.id}`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/merge-patch+json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      setBook((prev) => ({ ...prev, ...dataToSend }));
      setEditBookOpen(false);
    } catch (err) {
      console.error("Błąd przy edycji książki:", err);
    }
  };



  const handleDelete = async () => {
    const confirmDelete = window.confirm("Czy na pewno chcesz usunąć tę książkę?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/books/${book.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      navigate("/library");
    } catch (err) {
      console.error("Błąd przy usuwaniu książki:", err);
    }
  };
  const handleEditClick = (note) => {
    setNoteToEdit(note);
    setEditContent(note.content);
    setEditNoteOpen(true);
  };
  const handleEditSave = async () => {
    try {
      const res = await axios.patch(
        `http://localhost:8080/api/notes/${noteToEdit.id}`,
        { content: editContent },
        {
          headers: {
            "Content-Type": "application/merge-patch+json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      setNotes((prev) =>
        prev.map((n) => (n.id === noteToEdit.id ? res.data : n))
      );
      setEditNoteOpen(false);
      setNoteToEdit(null);
      setEditContent("");
    } catch (err) {
      console.error("Błąd przy edytowaniu notatki:", err);
    }
  };


  const handleAddNote = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/notes",
        {
          content: newNoteContent,
          book: `/api/books/${id}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNotes((prev) => [...prev, res.data]);
      setNewNoteContent("");
      setAddOpen(false);
    } catch (err) {
      console.error("Błąd przy dodawaniu notatki:", err);
    }
  };


  const handleDeleteNote = async (noteId) => {
      const confirm = window.confirm("Czy chcesz usunąć tę notatkę?");
      if (!confirm) return;

      try {
        await axios.delete(`http://localhost:8080/api/notes/${noteId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
      } catch (err) {
        console.error("Błąd przy usuwaniu notatki:", err);
      }
    };


  if (!book) return <Typography sx={{ p: 4 }}>Ładowanie...</Typography>;



  return (
    <Box sx={{ p: 4 }}>
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
      <Box display="flex" gap={4} alignItems="flex-start">
        {/* LEWA KOLUMNA: Książka */}
        <Card sx={{ width: 400 }}>
          {book.filePath && (
            <CardMedia
              component="img"
              height="300"
              image={`http://localhost:8080${book.filePath}`}
              alt={book.title}
            />
          )}
          <CardContent>
            <Typography variant="h4">{book.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Autor: {book.author}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Opis: {book.description || "Brak opisu"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Ocena: {book.rating}/10
            </Typography>
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button variant="outlined" sx={{ mr: 2 }} onClick={() => setEditBookOpen(true)}>
                Edytuj
              </Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Usuń
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* PRAWA KOLUMNA: Notatki */}
        <Box sx={{ flex: 1, maxWidth: 600 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>Notatki</Typography>
          <Box>
            <Button variant="contained" onClick={() => setAddOpen(true)}>
              Dodaj notatkę
            </Button>
          </Box>
        </Box>


          {notes.length === 0 ? (
            <Typography variant="body2">Brak notatek do tej książki.</Typography>
          ) : (
            notes.map((note) => (
              <Accordion key={note.id} sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    minHeight: 48,
                    maxHeight: 48,
                    '& .MuiAccordionSummary-content': {
                      overflow: 'hidden',
                    },
                  }}
                >
                  <Typography
                    noWrap
                    sx={{
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {note.content.split("\n")[0]}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography whiteSpace="pre-wrap">{note.content}</Typography>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <IconButton size="small" onClick={() => handleEditClick(note)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteNote(note.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      </Box>

        {/* Dialog edycji */}
        <Dialog open={editBookOpen} onClose={() => setEditBookOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edytuj książkę</DialogTitle>
          <DialogContent>
            <TextField
              label="Tytuł"
              name="title"
              fullWidth
              margin="normal"
              value={formData.title}
              onChange={handleEditChange}
            />
            <TextField
              label="Autor"
              name="author"
              fullWidth
              margin="normal"
              value={formData.author}
              onChange={handleEditChange}
            />
            <TextField
              label="Opis"
              name="description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleEditChange}
            />
            <TextField
              label="Ocena"
              name="rating"
              type="number"
              inputProps={{ min: 1, max: 10 }}
              fullWidth
              margin="normal"
              value={formData.rating}
              onChange={handleEditChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditBookOpen(false)}>Anuluj</Button>
            <Button variant="contained" onClick={handleEditSubmit}>
              Zapisz
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Dodaj notatkę</DialogTitle>
          <DialogContent>
            <TextField
              label="Treść notatki"
              multiline
              fullWidth
              minRows={4}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>Anuluj</Button>
            <Button variant="contained" onClick={handleAddNote}>Zapisz</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={editNoteOpen} onClose={() => setEditNoteOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edytuj notatkę</DialogTitle>
          <DialogContent>
            <TextField
              label="Treść notatki"
              multiline
              fullWidth
              minRows={4}
              margin="normal"
              variant="outlined"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditNoteOpen(false)}>Anuluj</Button>
            <Button variant="contained" onClick={handleEditSave}>Zapisz</Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};

export default BookDetails;
