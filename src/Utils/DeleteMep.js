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
import { saveMep, getMep } from '../Utils/indexeddb';

const DeleteMep = () => {
    const [alertText, setAlertText] = React.useState("");
    const [snackBarSeverity, setSnackBarSeverity] = React.useState("error");
    const [openSnackbar, setOpenSnackbar] = React.useState(false); 
    const [meps, setMeps] = React.useState([]); 
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
            }, 4000);
        }
    }, [openSnackbar]);

    const deleteItem = id => {
        meps.splice(id,1)
        saveDataIndexedDb(meps)
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
            <Box sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{color:writingColor, marginBottom:"1em"}}>Delete a MEP</Typography>
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
                                <CardActions>
                                    <Button size="small" color="primary" onClick={()=>deleteItem(id)}>
                                        Delete
                                    </Button>
                                </CardActions>
                        </Card>
                    ))}
                </Stack>
            </Paper>
              
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <MuiAlert onClose={handleCloseSnackbar} severity={snackBarSeverity} sx={{ width: '100%' }}>
                    {alertText}
                </MuiAlert>
            </Snackbar>

        </div>
    );
};

export default DeleteMep;
