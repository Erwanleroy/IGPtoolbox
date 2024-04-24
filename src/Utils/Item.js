// Item.js
import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function Item({nom,image,desc,code}) {
    let lightModeStored = localStorage.getItem("lightMode");
    const [open, setOpen] = React.useState(false);
  
    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };
  
    const imageStyle = {
        width: '20vw',
        height: '20vh',
    }
    const flexAccordeon = {
        display: 'flex',
        justifyContent: 'space-evenly',
    }
    const flexDiv = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    }

    const codeBlock = {
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '5px', 
        fontFamily: 'monospace', 
    }

    if (lightModeStored==="dark"){
        codeBlock.color="black"
    }

    return (
        <div>
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                >
            {nom}
            </AccordionSummary>
            <AccordionDetails style={flexAccordeon}>
                <div>
                    <img style={imageStyle} alt="chien" src={image}></img>
                </div>
                <div style={flexDiv}>
                    {desc}
                    <div>
                        <Button onClick={handleClickOpen}>
                        Voir le code
                        </Button>
                        <Button variant="outlined">Copier</Button>
                    </div>
                </div>
            </AccordionDetails>
        </Accordion>
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth="xl"
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            >
            <DialogTitle id="alert-dialog-title">
                Détail de la commande
            </DialogTitle>
            <DialogContent>
                <Box style={codeBlock}>
                    <Typography component="pre" style={{ fontSize: '1em', fontFamily: "monospace" }}>{code}</Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={handleClose}>Copier la commande</Button>
                <Button onClick={handleClose} autoFocus>
                    Fermer
                </Button>
            </DialogActions>
        </Dialog>
    </div>
    );
  }
  
  
  