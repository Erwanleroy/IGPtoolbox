// Item.js
import React from 'react';
import { 
    Accordion, 
    AccordionSummary, 
    AccordionDetails, 
    Button, 
    Dialog, 
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopy from '@mui/icons-material/ContentCopy';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Star from '@mui/icons-material/Star';
import { getData } from '../Utils/indexeddb'; // Importer la fonction pour récupérer les données

/*
composant :     La categorie du composant
id :            L'identifiant de l'item
*/
export default function Item({ composant, id, forceRefresh }) {
    let lightModeStored = localStorage.getItem("lightMode");
    //on recupere les donnees du store
    let localStore = localStorage.getItem(composant) ? JSON.parse(localStorage.getItem(composant)) : []
    const timeoutRef = React.useRef(null); // Utilisation d'une ref pour stocker le timeout
    const [open, setOpen] = React.useState(false);
    const [alertVisible, setAlertVisible] = React.useState(false);
    const [alertText, setAlertText] = React.useState(null);
    const [alertIcon, setAlertIcon] = React.useState(null);
    const [favState, setFavState] = React.useState(localStore.includes(id));
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [nom, setNom] = React.useState('N/A');
    const [image, setImage] = React.useState('');
    const [desc, setDesc] = React.useState('Pas de description initialisée');
    const [code, setCode] = React.useState('');
    
    
    React.useEffect(() => {
        const fetchData = async () => {
          try {
            const jsonData = await getData();
            
            const donneesDeCetteCategorie = jsonData.categories.find(
              (category) => category.name === composant
            );
    
            if (donneesDeCetteCategorie && donneesDeCetteCategorie.items) {
              const itemTrouve = donneesDeCetteCategorie.items.find(
                (item) => item.id === id
              );
              
              if (itemTrouve) {
                setNom(itemTrouve.nom ?? 'N/A');
                setImage(itemTrouve.image ?? '');
                setDesc(itemTrouve.desc ?? 'Pas de description');
                setCode(itemTrouve.code ?? '');
              }
            }
    
            setIsLoading(false); // Marquer comme chargé
          } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError(err); // Conserver l'erreur
          }
        };
    
        fetchData(); // Toujours appeler fetchData
      }, [composant, id]); // Dépendances appropriées
    
      React.useEffect(() => {
        const updatedFav = localStore.includes(id);
        setFavState(updatedFav);
      }, [localStore, id]);
    
      if (isLoading) {
        return <div>En cours de chargement...</div>;
      }
    
      if (error) {
        return <div>Erreur: {error.message}</div>;
      }

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const boutonFav = event => {
        event.stopPropagation() 
        setFavState(!favState)
        //on recupere les donnes des favoris pour la page actuelle en json
        let oldStore=localStorage.getItem(composant)
        //Si le storage n'est pas initialisé, on le fait :-)
        oldStore = oldStore ? JSON.parse(oldStore) : []
        //Si notre favoris actuel est present dans le store
        if (timeoutRef.current) {
            // Si un timeout existe déjà, annulez-le avant d'en créer un nouveau
            clearTimeout(timeoutRef.current);
        }
        if(oldStore.includes(id)){
            setAlertIcon(<StarBorderIcon fontSize="inherit"/>)
            setAlertText("Favoris supprimé")
            //nouvelle version du store sans le favoris
            let newStore = oldStore.filter((item) => item !== id)
            //on pousse cette version dans le storage
            localStorage.setItem(composant, JSON.stringify(newStore))
            //sinon
        }else{
            setAlertIcon(<Star fontSize="inherit"/>)
            setAlertText("Favoris ajouté 🎉")
            //on ajoute notre valeur au storage
            oldStore.push(id)
            localStorage.setItem(composant, JSON.stringify(oldStore))
        }
        forceRefresh()
        setAlertVisible(true); //popup pour dire bien copié
        timeoutRef.current = setTimeout(() => {
            setAlertVisible(false);
        }, 3000);
    }

    const boutonCopie = event => {
        event.stopPropagation()
        navigator.clipboard.writeText(code);
        if (timeoutRef.current) {
            // Si un timeout existe déjà, annulez-le avant d'en créer un nouveau
            clearTimeout(timeoutRef.current);
        }
        setAlertIcon(<ContentCopy fontSize="inherit"/>)
        setAlertText("Copie réussie 🎉")
        setAlertVisible(true); //popup pour dire bien copié
        timeoutRef.current = setTimeout(() => {
            setAlertVisible(false);
          }, 3000);
    }
  
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

    const alertStyle = {
        position: 'absolute',
        bottom: '10px',
        zIndex: '9999',
        transform: alertVisible ? 'translateX(0)' : 'translateX(-100%)', 
        transition: 'transform .5s', 
    }

    const buttonHeader = {
        borderRadius:'3em',
        position:'absolute',
        top:'50%',
        transform:'translateY(-50%)',
        right:'5em',
    }

    const buttonFav = {
        right: parseInt(buttonHeader.right) * 2 + 'em', //Vaut le double de la taille du bouton "de base", pour décaler t'as vu
    }

    if (lightModeStored==="dark"){
        codeBlock.color="black"
    }

    return (
        <div>
            <Accordion style={{margin:'10px'}}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    style={{display: 'flex'}}
                    >
                    <p>{nom}</p>
                    <Button variant="filled" style={buttonHeader} onClick={boutonCopie}>
                        <ContentCopy />
                    </Button>
                    <Button variant="filled" style={{...buttonHeader, ...buttonFav}} onClick={boutonFav}>
                        {favState ? <Star/> : <StarBorderIcon/>}
                    </Button>
                </AccordionSummary>
                <AccordionDetails style={flexAccordeon}>
                    <div>
                        <img style={imageStyle} alt="Lien image KO" src={image}></img>
                    </div>
                    <div style={flexDiv}>
                        {desc}
                        <div>
                            <Button onClick={handleClickOpen}>
                            Voir le code 
                            </Button>
                            <Button variant="outlined" onClick={boutonCopie}>Copier</Button>
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
                    <Button variant="outlined" onClick={boutonCopie}>Copier la commande</Button>
                    <Button onClick={handleClose} autoFocus>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>

            <Alert 
                style={alertStyle} 
                variant="filled" 
                icon={alertIcon}
                severity="warning">
                {alertText}   
            </Alert>
        </div>
    );
  }
  
  
  