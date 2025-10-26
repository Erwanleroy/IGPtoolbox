import React from 'react';
import { 
    Paper, 
    Card, 
    Stack, 
    Snackbar, 
    Typography, 
    Box,
    CardActions,
    CardContent,
    Button,
    Modal,
    TextField
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { saveMep, getMep } from './indexeddb';

const RunMep = () => {
    const [alertText, setAlertText] = React.useState("");
    const [snackBarSeverity, setSnackBarSeverity] = React.useState("error");
    const [openSnackbar, setOpenSnackbar] = React.useState(false); 
    const [snackbarTimeout, setSnackbarTimeout] = React.useState(4000); 
    const [meps, setMeps] = React.useState([]); 
    const [mepSelected, setMepSelected] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(false);
    const [openModal, setOpenModal] = React.useState(false);
    const [stepTitle, setStepTitle] = React.useState("");
    const [stepCommand, setStepCommand] = React.useState("");
    const [refreshData, setrefreshData] = React.useState(0); 
    const bgColor = localStorage.getItem("lightMode") === 'dark' ? '#272727' : ""
    const writingColor = localStorage.getItem("lightMode") === 'dark' ? '#FFF' : ""
    
    const handleOpen = () => setOpenModal(true);
    const handleClose = () => setOpenModal(false);

    const sxTextField = {
        minWidth: "80%",
        margin:"2em 0",
        '& .MuiInput-underline:before': {
            borderBottomColor: writingColor, // Couleur de la bordure avant le focus
        },
        '& .MuiInput-underline:hover:before': {
            borderBottomColor: writingColor, // Couleur de la bordure au hover
        },
        '& .MuiFormLabel-root': {
            color: writingColor, // Couleur du label
        },
        '& .MuiInputBase-input': {
            color: writingColor, // Couleur du texte entré
            borderColor: writingColor
        },
        '& fieldset': {
            borderColor: 'writingColor', // Couleur de la bordure normale
        },
    }

    const loadData = async () => {
        const importedData = await getMep();
        if (importedData) {
            if (!Array.isArray(importedData) || !importedData.length === 0) {
                var mepsArray=Object.values(importedData.mep)
            }else{var mepsArray=[]}
            setMeps(mepsArray)
        }
    }

    React.useEffect(() => {
        loadData();
    }, [refreshData]);

    React.useEffect(() => {
        if (openSnackbar) {
            setTimeout(() => {
                setOpenSnackbar(false)
            }, snackbarTimeout);
            setSnackbarTimeout(3000)
        }
    }, [openSnackbar]);

    const deleteItem = () => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cette MEP ?")) {
          const updatedMeps = [...meps]; // Copie pour éviter les mutations directes
          if (mepSelected >= 0 && mepSelected < updatedMeps.length) {
              updatedMeps.splice(mepSelected, 1);
              saveDataIndexedDb(updatedMeps);
              selectItem(false)
          } else {
              console.error("Index de suppression invalide :", mepSelected);
          }
      }
    }

    const selectItem = id => {
      setMepSelected(id)
    }

    const deleteStep = id => {
        const updatedMeps = [...meps]; // Copie pour éviter les mutations directes
        updatedMeps[mepSelected].planDeMep.splice(id, 1);
        setAlertText("This step has been deleted 🎉 !! ")
        saveDataIndexedDb(updatedMeps);
    }

    const getCommand = id => {
      setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
      setSnackBarSeverity("info")
      setSnackbarTimeout(6000)
      id!==0?setAlertText(meps[mepSelected].planDeMep[id].command):setAlertText("Pas de commande renseignée");
    }

    const modifyStep = id => {
        setCurrentStep(id)
        handleOpen()
        setStepTitle(meps[mepSelected].planDeMep[id].step)
        setStepCommand(meps[mepSelected].planDeMep[id].command)
    }
    
    const editIt = () => {
        const updatedMeps = [...meps]; // Copier l'état actuel
        updatedMeps[mepSelected].planDeMep[currentStep] = { 
            step: stepTitle, 
            command: stepCommand // ici tu avais mis stepTitle au lieu de stepCommand
        };
        
        setMeps(updatedMeps); // Mettre à jour l'état avec la nouvelle version
        saveDataIndexedDb(updatedMeps); // Sauvegarde dans IndexedDB
        setAlertText("This MEP has been edited 🎉 !! ")
        handleClose(); // Fermer le modal après l'édition
    }

    const saveDataIndexedDb = async (data) => {
        try {
          if(data){
            await saveMep({ mep: data });
            setrefreshData(refreshData+1)
            setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
            setSnackBarSeverity("success")
          }
        } catch (error) {
            setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
            setSnackBarSeverity("error")
            setAlertText("Error while the saving ?")
            return
        }
    }

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false); // Fermer le Snackbar
    };

    return (
        <div style={{backgroundColor:bgColor}}>
          {mepSelected===false? (
            <div>
              <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{color:writingColor, marginBottom:"1em"}}>Edit a MEP (on dev 🛠)</Typography>
              </Box>
              <Paper elevation={3} style={{margin:"0 10vw"}}>

                <Stack spacing={2}>
                    {Array.from({ length: meps.length }, (_,id) => (
                        <Card 
                            key={id}
                            style={{margin:"2em"}}
                            >
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {meps[id].mepId}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        <u>Plan de mep:</u><br/>
                                        {meps[id].planDeMep
                                            .slice(0, 6) // Prendre les 6 premiers éléments seulement
                                            .map((step, index) => (
                                            <span key={index}>
                                                {index > 0 && " -> "} {step.step}
                                            </span>
                                            ))}
                                        {meps[id].planDeMep.length > 6 && " ..."}
                                    </Typography>
                                </CardContent>
                                <CardActions style={{ display: "flex", justifyContent: "center" }}>
                                  <Button size="small" variant="outlined" color="primary" onClick={() => selectItem(id)}>
                                      Edit
                                  </Button>
                              </CardActions>
                        </Card>
                    ))}
                </Stack>
              </Paper>
            </div>
          ) : (
          <div>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{color:writingColor, marginBottom:"1em"}}>Running : {meps[mepSelected].mepId}</Typography>
            </Box>
            <Paper elevation={3} style={{margin:"0 20vw 0 2vw", padding:"2em 5em"}}>

            {meps[mepSelected].planDeMep
                .map((step, index) => (<Card
                  key={index}
                  style={{
                    backgroundColor: bgColor,
                    margin: "2em 0",
                    height: "20vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative", // Permet aux boutons absolus de se positionner correctement
                    padding: "1em"
                  }}
                >
                <CardContent>
                    <p style={{ fontSize: "2em" }}>{step.step}</p>
                    <p style={{ fontSize: ".8em" }}>{step.command}</p>
                </CardContent>
                
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() =>deleteStep(index)}
                    style={{
                      fontSize:"0.5em",
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                    }}
                  >
                    Delete this step
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() =>modifyStep(index)}
                    style={{
                      fontSize:"0.5em",
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                    }}
                  >
                    Modify
                  </Button>
                </Card>
              ))}
            </Paper>

            <Button size="small" color="info" variant="outlined" onClick={()=>selectItem(false)}
              style={{
                position : 'absolute',
                right:'2vw',
                top:'20vh',
                width:'16vw'
              }}
            >
              Select an other MEP
            </Button>
              <Button size="small" color="error" variant="contained" onClick={()=>deleteItem()}
                style={{
                  position : 'fixed',
                  right:'2vw',
                  top:'85vh',
                  width:'16vw',
                  height:'10vh'
                }}
              >
                Delete MEP
              </Button>


                <Modal
                open={openModal}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                >
                    <Card style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: bgColor,
                        color:writingColor,
                        border: '2px solid #000',
                    }}>
                        <CardContent>
                        Edit "{meps[mepSelected]?.planDeMep[currentStep]?.step || ""}"
                        <TextField
                                label="Step Title"
                                variant="outlined"
                                fullWidth
                                sx={sxTextField}
                                InputLabelProps={{ shrink: true }}
                                value={stepTitle}
                                onChange={(e) => setStepTitle(e.target.value)}
                            />
                        <TextField
                            label="Step Command"
                            variant="outlined"
                            fullWidth
                            sx={sxTextField}
                            InputLabelProps={{ shrink: true }}
                            value={stepCommand}
                            onChange={(e) => setStepCommand(e.target.value)}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", width: "90%" }}>
                            <Button size="small" color="error" variant="contained" onClick={()=>handleClose()}>
                                Cancel
                            </Button>
                            <Button size="small" color="success" variant="contained" onClick={()=>editIt()}>
                                Apply
                            </Button>
                        </div>
                        </CardContent>    
                    </Card>
                </Modal>
          </div>
          ) }

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <MuiAlert onClose={handleCloseSnackbar} severity={snackBarSeverity} sx={{ width: '100%' }}>
                    {alertText}
                </MuiAlert>
            </Snackbar>

        </div>
    );
};

export default RunMep;
