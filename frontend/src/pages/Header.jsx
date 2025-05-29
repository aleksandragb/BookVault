import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith("/profile")) return "Profil";
    if (location.pathname.startsWith("/book/")) return "Szczegóły książki";
    if (location.pathname.startsWith("/library")) return "Biblioteka";
    return "Aplikacja";
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {getPageTitle()}
        </Typography>
        <IconButton color="inherit" onClick={handleMenuOpen}>
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              navigate("/profile");
              setAnchorEl(null);
            }}
          >
            Profil
          </MenuItem>
          <MenuItem onClick={handleLogout}>Wyloguj się</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
