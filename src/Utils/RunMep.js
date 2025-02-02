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
    Button
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { saveMep, getMep } from './indexeddb';

const RunMep = () => {
    const [alertText, setAlertText] = React.useState("");
    const [snackBarSeverity, setSnackBarSeverity] = React.useState("error");
    const [openSnackbar, setOpenSnackbar] = React.useState(false); 
    const [snackbarTimeout, setSnackbarTimeout] = React.useState(4000); 
    const [meps, setMeps] = React.useState([]); 
    const [stepError, setStepError] = React.useState([]); 
    const [mepSelected, setMepSelected] = React.useState(false); 
    const [stepNumber, setStepNumber] = React.useState(0); 
    const [refreshData, setrefreshData] = React.useState(0); 
    const bgColor = localStorage.getItem("lightMode") === 'dark' ? '#272727' : ""
    const writingColor = localStorage.getItem("lightMode") === 'dark' ? '#FFF' : ""

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
      //si on change de mep on reset les erreurs par step
      if (id===false){
        setStepError([])
        setStepNumber(0)
      }else{
        // on met dans le presse papier le premier step
        addToPressPapier(meps[id].planDeMep[0].command)
      }
      setMepSelected(id)
    }

    const errorOnStep = id => {
      setStepError((prev) => [...prev, id]);
    }

    const successOnStep = id => {
      setStepError((prev) => prev.filter((item) => item !== id));
    }

    const getCommand = id => {
      setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
      setSnackBarSeverity("info")
      setSnackbarTimeout(6000)
      id!==0?setAlertText(meps[mepSelected].planDeMep[id].command):setAlertText("Pas de commande renseignée");
    }

    const changeStep = id => {
      let nouveauStep=stepNumber+id
      if(nouveauStep<0){
        setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
        setSnackBarSeverity("error")
        setAlertText("Already the first step !! ")
        return
      }
      if(nouveauStep>=meps[mepSelected].planDeMep.length){
        setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
        setSnackBarSeverity("error")
        setAlertText("No more step !! ")
        return
      }
      // on met dans le presse papier le novueau step
      addToPressPapier(meps[mepSelected].planDeMep[nouveauStep].command)
      setStepNumber(nouveauStep)
    }

    const addToPressPapier = text => {
      if(text=="") return;
      navigator.clipboard.writeText(text)
        .then(() => {
          setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
          setSnackBarSeverity("success")
          setAlertText("Copy OK 😎") 
        })
        .catch(err => {
          setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
          setSnackBarSeverity("error")
          setAlertText("Copy  KO 😣") 
        });
    }

    const saveDataIndexedDb = async (data) => {
        try {
          if(data){
            await saveMep({ mep: data });
            setrefreshData(refreshData+1)
            setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
            setSnackBarSeverity("success")
            setAlertText("This MEP has been deleted 🎉 !! ")
          }
        } catch (error) {
            setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
            setSnackBarSeverity("error")
            setAlertText("Error while deleting ?")
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
              <Typography variant="h4" sx={{color:writingColor, marginBottom:"1em"}}>Chose the MEP to Run</Typography>
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
                                      Select
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
                    //check erreur > check si step actuel > check si step precedent > sinon
                    backgroundColor:
                    stepError.includes(index) 
                        ? "red"
                        :index === stepNumber
                          ? "orange"
                          : index > stepNumber
                            ? "grey"
                            : "green",
                    margin: "2em 0",
                    height: "20vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative", // Permet aux boutons absolus de se positionner correctement
                    padding: "1em"
                  }}
                >
                  <CardContent style={{ fontSize: "2em" }}>{step.step}</CardContent>
                
                  <Button
                    size="small"
                    variant="contained"
                    color={stepError.includes(index) ? "success" : "error"}
                    onClick={() =>
                      stepError.includes(index) ? successOnStep(index) : errorOnStep(index)
                    }
                    style={{
                      fontSize:"0.5em",
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                    }}
                  >
                    {stepError.includes(index) ? "On Success" : "On Error"}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() =>changeStep(-stepNumber+index)}
                    style={{
                      fontSize:"0.5em",
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                    }}
                  >
                    Select
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="info"
                    onClick={() =>getCommand(index)}
                    style={{
                      fontSize:"0.5em",
                      position: "absolute",
                      bottom: "10px",
                      left: "10px",
                    }}
                  >
                    Command
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
            <Button size="small" color="secondary" variant="outlined" onClick={()=>changeStep(-1)}
              style={{
                position : 'fixed',
                right:'2vw',
                top:'75vh',
                width:'16vw'
              }}
            >
              Previous Step
            </Button>

            { stepNumber === meps[mepSelected].planDeMep.length-1 ? (
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
            ):(
              <Button size="small" color="success" variant="contained" onClick={()=>changeStep(1)}
              style={{
                position : 'fixed',
                right:'2vw',
                top:'85vh',
                width:'16vw'
              }}
            >
              Next Step
            </Button>
            )}
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
