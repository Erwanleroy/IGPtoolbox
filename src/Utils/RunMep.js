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
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
    Slide,
    IconButton,
    AppBar,
    Toolbar,
    List,
    ListItemButton,
    ListItemText,
    Divider,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import CsvIcon from '@mui/icons-material/GridOn';
import MuiAlert from '@mui/material/Alert';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // pour générer des tableaux facilement
import { saveMep, getMep } from './indexeddb';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
    const [compteRendu, setCompteRendu] = React.useState([]);
    const [commentaire, setCommentaire] = React.useState("");
    const [openComment, setOpenComment] = React.useState(false);
    const [openLog, setOpenLog] = React.useState(false);
    const bgColor = localStorage.getItem("lightMode") === 'dark' ? '#272727' : ""
    const writingColor = localStorage.getItem("lightMode") === 'dark' ? '#FFF' : ""
    const time = () => new Date().toLocaleTimeString('fr-FR', { hour12: false });
    const outputs = [
  	{ key: "Mail", secondary: "Generate a mail, for a public communication", icon: <EmailIcon />},
  	{ key: "MD", secondary: "Generate a .md file, for a pretty render", icon: <DescriptionIcon/> },
  	{ key: "PDF", secondary: "Generate a .pdf file, for everyone", icon: <PictureAsPdfIcon/> },
  	{ key: "CSV", secondary: "Generate a .csv file, for a technical render", icon: <CsvIcon/> },
    ];

    const generateOutput = (output) => {
      var tableau = compteRendu.map(row => [...row]);
      tableau.forEach(row => {
        if (stepError.includes(row[1])) {
        	row.push("KO");
        }
      })

      tableau = tableau.map(row => {
         const newRow = [...row];
         while (newRow.length < 5) newRow.push("");
         return newRow.slice(0, 5);
      })

      switch (output) {
        case "Mail":
	  generateMail(tableau)
          break;
        case "MD":
          generateMD(tableau)
          break;
        case "PDF":
	  generatePDF(tableau)
          break;
        case "CSV":
          downloadCSV(tableau)
          break;
        default:
          setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
          setSnackBarSeverity("error")
        setAlertText("Erreur interne");
          setSnackbarTimeout(6000)
          break;
      }
    };

    const generateMail = (tableau) => {
      let subject = "Compte Rendu de la MEP";
      let body = "Bonjour,\n\nVoici le compte rendu de la MEP :\n\n";
    
      tableau.forEach(row => {
        if (typeof row[1] === "string") {
          body += `- ${row[0]} : ${row[1]}\n`;
        } else {
          const status = row[4] === "KO" ? "KO ❌" : "OK ✅";
          body += `- ${row[0]} : ${row[2]} | Statut: ${status}\n`;
        }
      });
    
      body += "\nCordialement,";
    
      // encode pour URL
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
      window.location.href = mailtoLink;
    };


    const generatePDF = (tableau) => {
      const doc = new jsPDF();
      const title = "Compte Rendu : " + meps[mepSelected].mepId;
    
      doc.setFontSize(16);
      doc.text(title, 14, 20);
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setLineWidth(0.8);
      doc.line(14, 25, pageWidth - 14, 25);
    
      let currentY = 30;
      const normalRows = [];
    
      tableau.forEach(row => {
        const status = row[4] === "KO" ? "KO" : "OK";
    
        if (typeof row[1] === "string") {
          // Ligne spéciale en liste
          doc.setFontSize(12);
          doc.text(`Remarque à ${row[0]} : ${row[1]}`, 14, currentY);
          currentY += 10;
        } else {
	  normalRows.push([row[0], row[2], row[3], status]);
        }
      });
    
      if (normalRows.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Timing", "Étape", "Commande", "Statut"]],
          body: normalRows,
          theme: "grid",
          styles: { fontSize: 12 },
          margin: { left: 14, right: 14 },
          headStyles: { fillColor: [220, 220, 220] },
        });
      }

      doc.save("compte_rendu.pdf");
    };

    const generateMD = (tableau) => {
      let md = "# Compte Rendu : "+ meps[mepSelected].mepId +"\n\n";
    
      // Début du premier tableau
      md += "| Timing | Étape | Commande | Statut |\n";
      md += "|--------|-------|----------|--------|\n";
    
      tableau.forEach(row => {
        const status = row[4] === "KO" ? "❌" : "✅";
        const command = row[3].replace(/\n/g, "<br>");
    
        if (typeof row[1] === "string") {
          // Ligne spéciale en liste
          md += `\n- \`${row[0]}\` : ${row[1]}\n\n`;
    
          // On peut recommencer un nouveau tableau si nécessaire
          md += "| Timing | Étape | Commande | Statut |\n";
          md += "|--------|-------|----------|--------|\n";
        } else {
          // Ligne normale dans le tableau
          md += `| \`${row[0]}\` | ${row[2]} | ${command} | ${status} |\n`;
        }
      });
    
      // Téléchargement automatique
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "compte_rendu.md";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    
    const downloadCSV = (tableau) => {
      const header = ["Timing", "Numéro d'étape", "Nom de l'étape", "Commande de l'étape", "Status"];
      tableau = [header, ...tableau];

      const csvContent = tableau
        .map(row => row.join(";"))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "compteRendu.csv");
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const loadData = async () => {
        const importedData = await getMep();
  	if (!importedData) return;

  	let mepsArray = []; // 🔹 Déclaration unique ici

  	if (Array.isArray(importedData.mep) && importedData.mep.length > 0) {
    	   mepsArray = importedData.mep;
  	} else if (importedData.mep && typeof importedData.mep === "object") {
    	   mepsArray = Object.values(importedData.mep);
  	}
  	setMeps(mepsArray);
    }

    const handleConfirmComment = () => {
        if (commentaire !== ""){
            setCompteRendu(prevCompteRendu => [...compteRendu, [time(), commentaire]])
            setCommentaire("")
        }
	document.activeElement.blur();
        setOpenComment(false);
    };

    React.useEffect(() => {
  	if (mepSelected !== false) {
    	   const createLog = () => {
    	        const exists = compteRendu.some(row => row[1] === stepNumber);
        	if (!exists) {
        	   const actualStep = meps[mepSelected].planDeMep[stepNumber];
        	   const newEntry = [time(), stepNumber, actualStep.step, actualStep.command];
        	   setCompteRendu(prev => [...prev, newEntry]);
      	   	}
    	   };
    	   createLog();
    	}
    }, [stepNumber, mepSelected, compteRendu, meps]);
 
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
    }, [openSnackbar, snackbarTimeout]);

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
      if(meps[mepSelected].planDeMep[id].command === ""){
	setAlertText("Pas de commande renseignée");
	return;
      }
      setAlertText(meps[mepSelected].planDeMep[id].command)
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
      // on met dans le presse papier le nouveau step
      addToPressPapier(meps[mepSelected].planDeMep[nouveauStep].command)
      setStepNumber(nouveauStep)
    }

    const addToPressPapier = text => {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
          setOpenSnackbar(true); // Ouvre le Snackbar en cas d'erreur
          setSnackBarSeverity("error")
          setAlertText("Presse papier non fonctionnel 😣")
    	return;
      }

      if(text==="") return;
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

    const handleOpenLog = () => {
    	setOpenLog(true);
    };

    const handleCloseLog = () => {
    	setOpenLog(false);
    };

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
            { stepNumber !== meps[mepSelected].planDeMep.length-1 ? (
	            <Button size="small" color="info" variant="contained" onClick={()=>setOpenComment(true)}
	              style={{
	                position : 'fixed',
	                right:'2vw',
	                top:'65vh',
	                width:'16vw'
	              }}
	            >
	              Comment
	            </Button>
            ):(
	            <Button size="small" color="warning" variant="contained" onClick={()=>handleOpenLog()}
	              style={{
	                position : 'fixed',
	                right:'2vw',
	                top:'65vh',
	                width:'16vw'
	              }}
	            >
	              getLog();
	            </Button>
	    )}
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
	      <Dialog fullWidth open={openComment} onClose={() => setOpenComment(false)}>
	        <DialogContent>
	          <TextField
	            autoFocus
	            margin="dense"
	            label="Comment"
	            type="text"
	            fullWidth
	            variant="outlined"
	            value={commentaire}
	            onChange={(e) => setCommentaire(e.target.value)}
	          />
	        </DialogContent>
	        <DialogActions>
	          <Button onClick={() => setOpenComment(false)}>Annuler</Button>
	          <Button onClick={handleConfirmComment} variant="contained">
	            OK
	          </Button>
	        </DialogActions>
	      </Dialog>
      	     <Dialog
        	fullScreen
        	open={openLog}
        	onClose={handleCloseLog}
        	slots={{
          	   transition: Transition,
        	}}>
        	<AppBar sx={{ position: 'relative' }}>
          	<Toolbar>
            	<IconButton
              	   edge="start"
              	   color="inherit"
              	   onClick={handleCloseLog}
              	   aria-label="close">
              		<CloseIcon />
            	</IconButton>
            	<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              	   getLog();
            	</Typography>
          	</Toolbar>
        	</AppBar>
        	<List>
		  {outputs.map((output, index) => (
		    <React.Fragment key={output.key}>
		      <ListItemButton sx={{ padding: '3vh 5vw' }} onClick={() => generateOutput(output.key)}>
			{output.icon}
		        <ListItemText sx={{ margin: '3vh 10vw' }} primary={output.key} secondary={output.secondary} />
		      </ListItemButton>
		      <Divider />
		    </React.Fragment>
		  ))}
		</List>
      	    </Dialog>
        </div>
    );
};

export default RunMep;
