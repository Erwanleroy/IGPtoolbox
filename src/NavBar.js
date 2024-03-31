import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Panel from './Panel';

export default function NavBar() {
  const [isPanelOpen, setIsPanelOpen] = useState(false); // État pour contrôler la visibilité du panel

  // Fonction de gestionnaire pour le clic sur le bouton du menu
  const handleMenuButtonClick = () => {
    setIsPanelOpen(!isPanelOpen); // Inverse l'état pour afficher ou masquer le panel
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenuButtonClick} 
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            IGP ToolBox
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      {isPanelOpen && <Panel />}
    </Box>
  );
}