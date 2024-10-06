import React from 'react';
import { TextField, Button, Snackbar, Typography, Box } from '@mui/material';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import MuiAlert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import { saveMep, getMep } from '../Utils/indexeddb';

const CreateMep = () => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [steps, setSteps] = React.useState(1);
    const [stepValues, setStepValues] = React.useState([{ step: '' }]); 
    const [commandValues, setCommandValues] = React.useState([{ command: '' }]);
    const [openSnackbar, setOpenSnackbar] = React.useState(false); 
    const [mepId, setMepId] = React.useState(""); 
    const [meps, setMeps] = React.useState([]); 
    const [isError, setIsError] = React.useState(false); 
    const [mepIdError, setMepIdError] = React.useState(false); 
    const [alertText, setAlertText] = React.useState("");
    const [snackBarSeverity, setSnackBarSeverity] = React.useState("error");
    const [refreshData, setrefreshData] = React.useState(0); 
    const bgColor = localStorage.getItem("lightMode") === 'dark' ? '#272727' : ""
    const writingColor = localStorage.getItem("lightMode") === 'dark' ? '#FFF' : ""
    
    const loadData = async () => {
        const importedData = await getMep();
        if (importedData) {
          setMeps(importedData)
        }
    }

    React.useEffect(() => {
        loadData();
    }, [refreshData]);

    React.useEffect(() => {
        if (openSnackbar) {
            setTimeout(() => {
                setOpenSnackbar(false)
                setIsError(false)
                setMepIdError(false)
            }, 4000);
        }
    }, [openSnackbar]);

    const addStep = () => {
        // Vérifie que tous les champs sont remplis
        const allFilled = stepValues.every(step => step.step.trim() !== '') 
        if (allFilled) {
            // Ajouter une nouvelle étape
            setStepValues([...stepValues, { step: '' }]);
            setCommandValues([...commandValues, { command: '' }]);
            setSteps(steps + 1);
            setIsError(false); // Réinitialiser l'état d'erreur
        } else {
            setIsError(true); // Met l'état d'erreur à true
            setSnackBarSeverity("error")
            setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
            setAlertText("Please fill all steps before adding another!")
        }
    }


    const emptyFields = () => {
        setSteps(1)
        setStepValues([{ step: '' }])
        setCommandValues([{ command: '' }])
        setMepId("")
    }

    const addMep = () => {
        const allFilled = stepValues.every(step => step.step.trim() !== '') 
        if (!allFilled) {
            setIsError(true); // Met l'état d'erreur à true
            setSnackBarSeverity("error")
            setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
            setAlertText("Please fill all steps before adding this MEP")
            return
        }

        if(mepId=="" || mepId==null || mepId==undefined){
            setMepIdError(true); // Met l'état d'erreur à true
            setSnackBarSeverity("error")
            setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
            setAlertText("Please fill the Mep ID before adding this MEP")
            return
        }

        const planDeMep = stepValues.map((step, index) => {
            return {
                step: step.step,
                command: commandValues[index].command // Utilisation de l'index pour obtenir la valeur correspondante
            };
        });
        if (!Array.isArray(meps) || !meps.length === 0) {
            var mepsArray=Object.values(meps.mep)
        }else{var mepsArray=[]}
        const exists = mepsArray.find(mep => mep.mepId === mepId);
        //Si ca existe déja => erreur et on clos la fonction
        if(exists){
            setMepIdError(true)
            setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
            setSnackBarSeverity("error")
            setAlertText("This MEP ID alreay exists")
            return
        }
        // Si ça n'existe pas, on crée notre nouvel item
        const newMep = { mepId, planDeMep };
        // Mettez à jour le tableau sans duplication
        const updatedMepsArray = [...mepsArray, newMep];
        saveDataIndexedDb(updatedMepsArray);
    }

    const saveDataIndexedDb = async (data) => {
        try {
          if(data){
            await saveMep({ mep: data });
            setrefreshData(refreshData+1)
            emptyFields()
            setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
            setSnackBarSeverity("success")
            setAlertText("This MEP has been added 🎉 !! ")
          }
        } catch (error) {
            setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
            setSnackBarSeverity("error")
            setAlertText("Error while saving ?")
            return
        }
    }

    const handleMepIdChange = (e) => { setMepId(e.target.value); };

    const handleStepChange = (index, value) => {
        const newValues = [...stepValues];
        newValues[index] = { step: value }; // Mettre à jour la valeur du step spécifique
        setStepValues(newValues);
    };

    const handleCommandChange = (index, value) => {
        const newValues = [...commandValues];
        newValues[index] = { command: value }; // Mettre à jour la valeur de la commande spécifique
        setCommandValues(newValues);
    };

    const handleDelete = (index) => {
        setStepValues((prev) => prev.filter((_, i) => i !== index));
        setCommandValues((prev) => prev.filter((_, i) => i !== index));
        setSteps(steps - 1); // Réduire le nombre d'étapes
    };


    const handleCloseSnackbar = () => {
        setOpenSnackbar(false); // Fermer le Snackbar
    };
    
    const isFieldEmpty = (field, type) => {
        if (isError) { // Vérifie seulement si l'état d'erreur est true
            if (type === 'step') {
                return stepValues[field].step.trim() === '';
            } else if (type === 'command') {
                return commandValues[field].command.trim() === '';
            }
        }
        return false;
    };


    return (
        <div style={{backgroundColor:bgColor}}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{color:writingColor, marginBottom:"1em"}}>Create a new MEP</Typography>
                <div>
                    <TextField 
                        label="Mep ID" 
                        variant="filled" 
                        onChange={handleMepIdChange} 
                        value={mepId}
                        error={mepIdError}
                        />
                </div>
                {Array.from({ length: steps }, (_,id) => (
                    <div key={id} style={{margin:"2em 10vw 0 10vw", display:"flex", justifyContent:"space-around"}}>
                        <TextField 
                            id={`step-${id}`} 
                            label={`Step n°${id + 1}`}  
                            variant="outlined" 
                            color="secondary"
                            style={{marginRight:"5vw",flexGrow:1}}
                            value={stepValues[id].step} // Liaison des valeurs des TextFields
                            onChange={(e) => handleStepChange(id, e.target.value)} 
                            error={isFieldEmpty(id, 'step')} // Affiche une bordure rouge si le champ est vide
                        />
                        <TextField
                            id={`command-${id}`} 
                            label="Command"
                            style={{ marginLeft:"5vw",flexGrow:4}}
                            multiline
                            color="secondary"
                            maxRows={4}
                            value={commandValues[id].command} // Liaison des valeurs des commandes
                            onChange={(e) => handleCommandChange(id, e.target.value)} // Mise à jour des valeurs
                        />
                        <DeleteIcon 
                            style={{ 
                                cursor: 'pointer', 
                                color:"red",
                                fontSize:"2em",
                                margin:"auto",
                                transform:"translateX(5vw)"
                            }} 
                            onClick={() => handleDelete(id)} // Appel à la fonction de suppression
                        />
                    </div>
                      ))}
                  <ControlPointIcon 
                    style={{
                        fontSize:"4em",
                        marginTop:"2vw",
                        color: isHovered ? 'orange' : writingColor, 
                        transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                        cursor:"pointer",
                        transition: 'transform 0.3s, color 0.3s', 
                    }}
                    onClick={() => addStep()}
                    onMouseEnter={() => setIsHovered(true)} 
                    onMouseLeave={() => setIsHovered(false)} 
                    />
            </Box>
            
            <Button onClick={addMep} variant="contained" color="success" sx={{ position: 'absolute', bottom: '5vh', right: '5vh' }}>
                Add this Mep
            </Button>

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <MuiAlert onClose={handleCloseSnackbar} severity={snackBarSeverity} sx={{ width: '100%' }}>
                    {alertText}
                </MuiAlert>
            </Snackbar>

        </div>
    );
};

export default CreateMep;
