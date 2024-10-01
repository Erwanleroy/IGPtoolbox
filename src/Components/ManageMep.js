import React from 'react';
import { CardContent, CardActions, Button, Typography, Box, Modal } from '@mui/material';
import CreateMep from '../Utils/CreateMep';

const ManageMep = ({ onUpdatePage }) => {
    const bgColor = localStorage.getItem("lightMode") === 'dark' ? '#272727' : ""
    const writingColor = localStorage.getItem("lightMode") === 'dark' ? '#D3D3D3' : ""
    const [open, setOpen] = React.useState(true);
    const [managingChoice, setmanagingChoice] = React.useState();


    const handleManagingChoice = e => {
      setmanagingChoice(e)
      handleClose()
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    return (
        <div>
            {/* Bouton pour ouvrir la carte */}
            <Button onClick={handleOpen} variant="contained" color="success" sx={{ position: 'absolute', top: '10vh', left: '50%', transform: 'translateX(-50%)' }}>
                Manage Mep
            </Button>

            {/* Modal avec la carte */}
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        color:writingColor,
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <CardContent>
                        <Typography variant="h5" component="div" sx={{ color:writingColor, textAlign: 'center', mb: 2 }}>
                            MEP Operations
                        </Typography>
                        <Typography variant="body2" sx={{ color:writingColor, textAlign: 'center', mb: 2 }}>
                            Manage all MEP processes here.
                        </Typography>
                    </CardContent>
                    <CardActions sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <p>Options :</p>
                        <Button variant="outlined" color="primary" sx={{ mb: 1, width: '100%' }} onClick={() => handleManagingChoice("Create")}>
                            Create MEP
                        </Button>
                        <Button variant="outlined" color="secondary" sx={{ mb: 1, width: '100%' }} onClick={() => handleManagingChoice("Edit")}>
                            Edit MEP
                        </Button>
                        <Button variant="outlined" color="error" sx={{ mb: 1, width: '100%' }} onClick={() => handleManagingChoice("Delete")}>
                            Delete MEP
                        </Button>
                        <Button variant="outlined" color="success"  sx={{ mb: 1, width: '100%' }} onClick={() => onUpdatePage("RunMep")}>
                            Run MEP
                        </Button>
                    </CardActions>
                </Box>
            </Modal>
            <div style={{marginTop:"10vh"}}>
            {managingChoice === 'Create' && (<CreateMep />)}

            </div>
        </div>
    );
};

export default ManageMep;
