// Item.js
import React from 'react';
import { useTheme, createTheme } from '@mui/material/styles';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ThemeProvider,
    TextField,
    Typography,
    Modal,
    Box,
    Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopy from '@mui/icons-material/ContentCopy';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EditIcon from '@mui/icons-material/Edit';
import Star from '@mui/icons-material/Star';
import { saveData, getData } from '../Utils/indexeddb'; // Importer la fonction pour récupérer les données

/*
composant :     La categorie du composant
id :            L'identifiant de l'item
*/
export default function Item({ composant, id, isOpen, handleToggle, forceRefresh }) {
    let lightModeStored = localStorage.getItem("lightMode");
    //on recupere les donnees du store
    let localStore = localStorage.getItem(composant) ? JSON.parse(localStorage.getItem(composant)) : []
    const timeoutRef = React.useRef(null); // Utilisation d'une ref pour stocker le timeout
    const [open, setOpen] = React.useState(false);
    const [openModal, setOpenModal] = React.useState(false);
    const [alertVisible, setAlertVisible] = React.useState(false);
    const [alertText, setAlertText] = React.useState(null);
    const [alertSeverity, setAlertSeverity] = React.useState("warning");
    const [alertIcon, setAlertIcon] = React.useState(null);
    const [favState, setFavState] = React.useState(localStore.includes(id));
    const [categories, setCategories] = React.useState('');
    const [nom, setNom] = React.useState(' ');
    const [image, setImage] = React.useState('');
    const [desc, setDesc] = React.useState('Pas de description initialisée');
    const [code, setCode] = React.useState('');
    const [openAccordeon, setOpenAccordeon] = React.useState(isOpen ? false : isOpen);
    const backgroundColor = lightModeStored === 'dark' ? '#272727' : "white"
    const writingColor = localStorage.getItem("lightMode") === 'dark' ? '#FFF' : ""

    const lightTheme = createTheme({
        palette: {
            mode: "light", // Choisissez le mode 'dark' pour activer le mode sombre
            primary: {
                main: "#F00", // Couleur primaire conditionnelle
            },
        },
    });

    const sxTextField = {
        minWidth: "80%",
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
            borderColor: 'white', // Couleur de la bordure normale
        },
    }


    React.useEffect(() => {
        setOpenAccordeon(isOpen)
    }, [isOpen]);


    React.useEffect(() => {
        if (composant && id) {
            const fetchData = async () => {
                try {
                    const jsonData = await getData();
                    setCategories(jsonData.categories);
                    const donneesDeCetteCategorie = jsonData.categories.find(
                        (category) => category.name === composant
                    );

                    if (donneesDeCetteCategorie && donneesDeCetteCategorie.items) {
                        const itemTrouve = donneesDeCetteCategorie.items.find(
                            (item) => item.id === id
                        );

                        if (itemTrouve) {
                            setNom(itemTrouve.nom ?? '');
                            setImage(itemTrouve.image ?? '');
                            setDesc(itemTrouve.desc ?? 'Pas de description');
                            setCode(itemTrouve.code ?? '');
                        }
                    }

                } catch (err) {
                    console.error('Erreur lors du chargement des données:', err);
                }
            };

            fetchData(); // Toujours appeler fetchData
        }
    }, [composant, id, forceRefresh]); // Dépendances appropriées

    React.useEffect(() => {
        if (localStore && id) {
            const updatedFav = localStore.includes(id);
            setFavState(updatedFav);
        }
    }, [localStore, id]);

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
        let oldStore = localStorage.getItem(composant)
        //Si le storage n'est pas initialisé, on le fait :-)
        oldStore = oldStore ? JSON.parse(oldStore) : []
        //Si notre favoris actuel est present dans le store
        if (timeoutRef.current) {
            // Si un timeout existe déjà, annulez-le avant d'en créer un nouveau
            clearTimeout(timeoutRef.current);
        }
        if (oldStore.includes(id)) {
            setAlertIcon(<StarBorderIcon fontSize="inherit" />)
            setAlertText("Favoris supprimé")
            //nouvelle version du store sans le favoris
            let newStore = oldStore.filter((item) => item !== id)
            if (newStore.length === 0) {
                localStorage.removeItem(composant)
            } else {
                localStorage.setItem(composant, JSON.stringify(newStore))
            }
            //sinon
        } else {
            setAlertIcon(<Star fontSize="inherit" />)
            setAlertSeverity("success")
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
        setAlertIcon(<ContentCopy fontSize="inherit" />)
        setAlertText("Copie réussie 🎉")
        setAlertVisible(true); //popup pour dire bien copié
        timeoutRef.current = setTimeout(() => {
            setAlertVisible(false);
        }, 3000);
    }

    const boutonEdit = event => {
        event.stopPropagation()
        setOpenModal(true)
    }


    const verifInputAddItem = () => {
        if (!composant || !nom || !desc || !image || !code) {
            if (timeoutRef.current) {
                // Si un timeout existe déjà, annulez-le avant d'en créer un nouveau
                clearTimeout(timeoutRef.current);
            }
            setAlertSeverity("error")
            setAlertText("All fields must be filled")
            setAlertVisible(true)
            timeoutRef.current = setTimeout(() => {
                setAlertVisible(false);
            }, 3000);
            return 1
        }
        return 0
    }

    const buildData = () => {
        return {
            name: composant,
            items: [
                {
                    id: id,
                    nom: nom,
                    image: image,
                    desc: desc,
                    code: code
                }]
        }
    }

    const itemEdition = () => {
        if (verifInputAddItem() === 0) {
            let itemToInsert = buildData()
            //on chope l'id de notre categorie
            const categoryIndex = categories.findIndex(category => category.name === itemToInsert.name);
            //on chope notre categorie
            const notreCategory = categories[categoryIndex]
            //on chope l'id de notre item
            const itemIndex = notreCategory.items.findIndex(item => item.id === itemToInsert.items[0].id);
            //on insere notre nouvelle item dans cette categorie
            notreCategory.items[itemIndex] = itemToInsert.items[0];
            //on insere la categorie dans le tout
            categories[categoryIndex] = notreCategory;
            //on met a jour le state
            setCategories([...categories]);
            //indexedDb
            saveDataIndexedDb()
            // :-)
            setOpenModal(false)
        }
    }

    const saveDataIndexedDb = async (data) => {
        try {
            if (data) {
                await saveData({ categories: data });
            } else {
                await saveData({ categories: categories });
            }
        } catch (error) {
            console.error("Error saving data to IndexedDB: ", error);
        }
    }

    const imageStyle = {
        width: '15em',
        height: '15em',
    }
    const flexAccordeon = {
        display: 'flex',
        justifyContent: 'space-evenly',
    }
    const flexDiv = {
        display: 'flex',
        minHeight: "7em",
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
        borderRadius: '3em',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        right: '5em',
    }

    const buttonFav = {
        right: parseInt(buttonHeader.right) * 2 + 'em', //Vaut le double de la taille du bouton "de base", pour décaler t'as vu
    }

    const buttonEdit = {
        right: parseInt(buttonHeader.right) * 3 + 'em', //Vaut le double de la taille du bouton "de base", pour décaler t'as vu
    }

    if (lightModeStored === "dark") {
        codeBlock.color = "black"
    }

    return (
        <div>
            <Accordion expanded={openAccordeon} style={{ margin: '10px' }} onChange={() => handleToggle(id)}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    style={{ display: 'flex' }}
                >
                    <p>{nom}</p>
                    <Button variant="filled" style={buttonHeader} onClick={boutonCopie}>
                        <ContentCopy />
                    </Button>
                    <Button variant="filled" style={{ ...buttonHeader, ...buttonFav }} onClick={boutonFav}>
                        {favState ? <Star style={{ color: '#FFD700' }} /> : <StarBorderIcon style={{ color: '#FFD700' }} />}
                    </Button>
                    <Button variant="filled" style={{ ...buttonHeader, ...buttonEdit }} onClick={boutonEdit}>
                        <EditIcon />
                    </Button>
                </AccordionSummary>
                <AccordionDetails style={flexAccordeon}>
                    <div>
                        <img style={imageStyle} alt="Lien image KO" src={image} ></img>
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
                        <Typography component="pre" style={{ fontSize: '1em', color: "#000", fontFamily: "monospace" }}>{code}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={boutonCopie}>Copier la commande</Button>
                    <Button onClick={handleClose} autoFocus>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>

            <Modal
                open={openModal}
                onClose={() => { setOpenModal(false); forceRefresh(-1) }}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box
                    sx={{
                        width: 400,
                        backgroundColor: backgroundColor,
                        margin: 'auto',
                        padding: 4,
                        borderRadius: 1,
                        boxShadow: 24,
                        mt: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <h2 id="modal-title" style={{ color: writingColor }}>Item Details</h2>
                    <ThemeProvider theme={lightTheme}>
                        <TextField
                            label="Item Name"
                            variant="outlined"
                            fullWidth
                            sx={sxTextField}
                            InputLabelProps={{ shrink: true }}
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                        />
                        <TextField
                            label="Item Description"
                            variant="outlined"
                            fullWidth
                            sx={sxTextField}
                            InputLabelProps={{ shrink: true }}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                        <TextField
                            label="Item Image URL"
                            variant="outlined"
                            fullWidth
                            sx={sxTextField}
                            InputLabelProps={{ shrink: true }}
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                        />
                        <TextField
                            label="Item Code"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={sxTextField}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />

                    </ThemeProvider>
                    <div style={{ display: "flex", justifyContent: "space-around" }}>
                        <Button
                            onClick={itemEdition}
                            variant="contained"
                            style={{ width: "45%" }}
                            color="success"
                        >
                            Save
                        </Button>
                        <Button
                            onClick={() => { setOpenModal(false); forceRefresh(-1) }}
                            variant="contained"
                            style={{ width: "45%" }}
                            color="error"
                        >
                            Close
                        </Button>
                    </div>
                </Box>
            </Modal>
            <Alert
                style={alertStyle}
                variant="filled"
                icon={alertIcon}
                severity={alertSeverity}>
                {alertText}
            </Alert>
        </div>
    );
}


