import React, { useState, useEffect, useRef } from 'react';
//import data from '../Utils/donnees.json';
import { saveData, getData } from '../Utils/indexeddb';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import { useTheme, createTheme } from '@mui/material/styles';
import {
  Button,
  Alert,
  Modal,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  FormControl,
  InputLabel,
  ThemeProvider,
  TextField,
  Select,
  MenuItem,
  Paper
} from '@mui/material';

const Extract = () => {
  const theme = useTheme();
  // État local pour suivre les cases à cocher des éléments
  const [data, setData] = useState();
  const [dataChecked, setDataChecked] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [categories, setCategories] = useState([]);
  const [itemCheckState, setItemCheckState] = useState({});
  const [isHoveringDelete, setIsHoveringDelete] = useState(false);
  const [isHoveringAdd, setIsHoveringAdd] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("warning");
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectCategory, setSelectCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemCode, setItemCode] = useState("");

  const timeoutRef = useRef(null); // Utilisation d'une ref pour stocker le timeout

  const lightTheme = createTheme({
    palette: {
      mode: "light", // Choisissez le mode 'dark' pour activer le mode sombre
      primary: {
        main: "#F00", // Couleur primaire conditionnelle
      },
    },
  });

  useEffect(() => {
    // Charger les données depuis IndexedDB lors du montage du composant
    async function loadData() {
      const importedData = await getData();
      if (importedData) {
        setData(importedData)
      }
    }
    loadData();
    getCheckedItems()
  }, []);

  useEffect(() => {
    if (data) { setCategories(data.categories) }
  }, [data]);

  useEffect(() => {
    if (categories && categories.length !== 0) { saveDataIndexedDb() }
  }, [categories]);

  //CSS
  const alertStyle = {
    position: 'fixed',
    bottom: '10px',
    zIndex: '9999',
    transform: alertVisible ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform .5s',
  }

  const diviseur = {
    width: "1px",
    height: "100vh",
    backgroundColor: "#999",
    position: "fixed",
    left: "50%",
    top: "0",
    zIndex: "-999",
    bottom: "0"
  }
  const button = {
    position: "fixed",
    bottom: "0",
    border: "1px solid",
    borderColor: "black",
    backgroundColor: "white",
    borderRadius: "10px",
    fontSize: "4em",
    transition: ".2s",
    cursor: "pointer",
    margin: "20px 0",
  }

  const buttonDelete = {
    ...button,
    right: "55vw",
  }

  const buttonDeleteHover = {
    ...buttonDelete,
    //backgroundColor:"#f5f5f5",
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    transform: "scale(1.3)"
  }


  const buttonAdd = {
    ...button,
    left: "55vw",
  }

  const buttonAddHover = {
    ...buttonAdd,
    //backgroundColor:"#f5f5f5",
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    transform: "scale(1.3)"
  }

  const handleClose = () => { setOpen(false); };
  const handleCloseSelect = () => { setOpenSelect(false); };
  const handleOpenSelect = () => { setOpenSelect(true); };
  const handleChangeSelect = (e) => { setSelectCategory(e.target.value); };
  const handleChangeItemName = (e) => { setItemName(e.target.value); };
  const handleChangeItemDesc = (e) => { setItemDesc(e.target.value); };
  const handleChangeItemImage = (e) => { setItemImage(e.target.value); };
  const handleChangeItemCode = (e) => { setItemCode(e.target.value); };
  // Fonction pour gérer le changement de la case à cocher d'un élément
  const handleItemCheckboxChange = (categoryId, itemId, isChecked) => {
    setItemCheckState(prevState => ({
      ...prevState,
      [`${categoryId}-${itemId}`]: isChecked
    }));
  };


  // Fonction pour cocher ou décocher tous les sous-éléments d'une catégorie
  const handleMasterButtonClick = (categoryId) => {
    const isAnyChildChecked = Object.keys(itemCheckState).some(key => key.startsWith(`${categoryId}-`) && itemCheckState[key]);
    const newState = {};
    categories.find(cat => cat.name === categoryId).items.forEach(item => {
      newState[`${categoryId}-${item.id}`] = !isAnyChildChecked;
    });
    setItemCheckState(prevState => ({
      ...prevState,
      ...newState,
      [categoryId]: !isAnyChildChecked
    }));
  };
  const getCheckedItems = () => {
    const checkedItems = [];
    Object.entries(itemCheckState).forEach(([key, value]) => {
      if (value) {
        const [categoryId, itemId] = key.split('-');
        if (itemId !== undefined) {
          checkedItems.push({ categoryId, itemId });
        }
      }
    });
    // Obtenir les données originales 
    const result = getOriginalDataForCheckedItems(checkedItems);
    // Retourner l'ensemble des données originales une fois que la boucle est terminée
    setDataChecked(result)
    return result
  };

  const getOriginalDataForCheckedItems = (checkedItems) => {
    const result = [];
    // Pour chaque élément dans checkedItems, obtenir les détails complets et les regrouper par catégorie
    checkedItems.forEach(({ categoryId, itemId }) => {
      const category = categories.find(cat => cat.name === categoryId);
      if (category) {
        const item = category.items.find(item => item.id === parseInt(itemId));
        if (item) {
          let categoryResult = result.find(cat => cat.name === categoryId);
          if (!categoryResult) {
            categoryResult = { name: categoryId, items: [] };
            result.push(categoryResult)
          }
          categoryResult.items.push(item);
        }
      }
    });
    return result;
  };


  // Fonction pour supprimer un item spécifique et vérifier si la catégorie est vide
  const removeItemAndEmptyCategory = (updatedData, categoryName, itemId) => {
    // Créer une copie de la structure de données
    const updatedCategories = updatedData.categories.map(category => {
      // Vérifier si c'est la catégorie recherchée
      if (category.name === categoryName) {
        // Filtrer les items pour retirer l'item avec l'ID spécifié
        const updatedItems = category.items.filter(item => item.id !== itemId);
        // Si la catégorie est vide après la suppression, retourner null
        // Sinon, retourner une nouvelle catégorie avec les items mis à jour
        return updatedItems.length > 0 ? { ...category, items: updatedItems } : null;
      }
      // Retourner la catégorie inchangée si ce n'est pas celle recherchée
      return category;
    }).filter(Boolean); // Filtrer pour supprimer les catégories nulles
    // Rendre les données sans l'item en argument
    return ({ categories: updatedCategories })
  };

  const removeAllChecked = () => {
    let updatedData = { categories: [...data.categories] };
    // va chercher le nom de la categorie et l'index de chaque item cliqué pour lancer la fonction de suppression
    dataChecked.forEach((category) => {
      const categoryName = category.name;
      category.items.forEach((item) => {
        const itemIndex = item.id;
        updatedData = removeItemAndEmptyCategory(updatedData, categoryName, itemIndex)
      });
    });
    setData(updatedData)
    saveDataIndexedDb()
    if (timeoutRef.current) {
      // Si un timeout existe déjà, annulez-le avant d'en créer un nouveau
      clearTimeout(timeoutRef.current);
    }
    setAlertSeverity("success")
    setAlertText("Données bien supprimée 🤩")
    setAlertVisible(true)
    timeoutRef.current = setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
    setOpen(false)
  };


  const deleteItems = () => {
    if (getCheckedItems().length === 0) {
      if (timeoutRef.current) {
        // Si un timeout existe déjà, annulez-le avant d'en créer un nouveau
        clearTimeout(timeoutRef.current);
      }
      setAlertSeverity("warning")
      setAlertText("Aucun item selectionné ❌")
      setAlertVisible(true)
      timeoutRef.current = setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
      return
    }
    // Afficher l'alert avec la chaîne de caractères construite
    setOpen(true)
  }

  const addItems = () => {
    console.log("là il faut ajouter un item :)")
  }

  const saveDataIndexedDb = async () => {
    try {
      await saveData({ categories: categories });
    } catch (error) {
      console.error("Error saving data to IndexedDB: ", error);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", width: "99%", margin: "auto", justifyContent: "space-between" }}>
        <div style={{ flex: 1, textAlign: "left", marginBottom: "25vh" }}>

          <Paper elevation={1} style={{
            margin: ".5em",
            textAlign: "center",
            fontSize: "1.5em",
            padding: "1em 0",
          }}>
            Remove items
          </Paper>
          {categories && categories.map(category => (
            category.name !== "IGP ToolBox" && (
              <div key={category.name} >
                <Button
                  onClick={() => handleMasterButtonClick(category.name)}
                  style={{ margin: "1em 0 0 1em" }}
                  variant="outlined"
                >
                  <strong>{category.name}</strong>
                </Button>
                {category.items.map(item => (
                  <div key={item.id}>
                    <input
                      style={{ marginLeft: "1em" }}
                      type="checkbox"
                      id={`${category.name}-${item.id}`} // ID unique pour chaque case à cocher d'élément
                      checked={itemCheckState[`${category.name}-${item.id}`] || false}
                      onChange={(e) => handleItemCheckboxChange(category.name, item.id, e.target.checked)}
                    />
                    <label htmlFor={`${category.name}-${item.id}`}>{item.nom}</label>
                    {/* Vous pouvez afficher d'autres détails de l'élément ici */}
                  </div>
                ))}
              </div>
            )))}

          <DeleteForeverIcon
            style={isHoveringDelete ? buttonDeleteHover : buttonDelete}
            onMouseEnter={() => setIsHoveringDelete(true)}
            onMouseLeave={() => setIsHoveringDelete(false)}
            variant="outlined"
            onClick={deleteItems}
          />
        </div>

        <div style={{ flex: 1, textAlign: "right", marginBottom: "10vh" }}>
          <Paper elevation={1} style={{
            margin: ".5em",
            textAlign: "center",
            fontSize: "1.5em",
            padding: "1em 0",
          }}>
            Add item
          </Paper>
          <ThemeProvider theme={lightTheme}>

            <FormControl variant="standard" style={{ margin: ".5em 10%" }} sx={{ minWidth: "80%" }}>
              <InputLabel id="selectCategoryLabel">Category</InputLabel>
              <Select
                labelId="selectCategoryLabel"
                id="selectCategory"
                open={openSelect}
                onClose={handleCloseSelect}
                onOpen={handleOpenSelect}
                value={selectCategory}
                MenuProps={{ disableScrollLock: true }} // Empêche le changement de position de défilement
                onChange={handleChangeSelect}
                style={{ textAlign: "left" }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.name} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Item Name"
              variant="standard"
              style={{ margin: ".5em 10%" }}
              sx={{ minWidth: "80%" }}
              value={itemName}
              onInput={handleChangeItemName}
            />
            <TextField
              label="Description"
              variant="standard"
              style={{ margin: ".5em 10%" }}
              sx={{ minWidth: "80%" }}
              value={itemDesc}
              onInput={handleChangeItemDesc}
            />
            <TextField
              label="Image URL"
              variant="standard"
              style={{ margin: ".5em 10%" }}
              sx={{ minWidth: "80%" }}
              value={itemImage}
              onInput={handleChangeItemImage}
            />
            <TextField
              label="Ligne de commande"
              variant="filled"
              multiline
              rows={4}

              style={{ margin: ".5em 10%" }}
              sx={{ minWidth: "80%" }}
              value={itemCode}
              onInput={handleChangeItemCode}
            />
          </ThemeProvider>

          <AddIcon
            style={isHoveringAdd ? buttonAddHover : buttonAdd}
            onMouseEnter={() => setIsHoveringAdd(true)}
            onMouseLeave={() => setIsHoveringAdd(false)}
            variant="outlined"
            onClick={addItems}
          />
        </div>
      </div>


      <div style={diviseur}></div>


      <Alert
        style={alertStyle}
        variant="filled"
        severity={alertSeverity}>
        {alertText}
      </Alert>
      <Modal open={open} onClose={handleClose} style={{ overflow: "auto" }}>

        <TableContainer component={Paper}>

          <Paper elevation={4} style={{
            padding: "1em 2em",
            margin: "1em 2em 0 2em",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            Remove selected items below :
            <span style={{ pright: 0 }}>
              <Button variant="contained" style={{ margin: "0 1em" }} onClick={removeAllChecked}>Delete</Button>
              <Button variant="outlined" onClick={handleClose}>Cancel</Button>
            </span>
          </Paper>
          <Table style={{ padding: "none" }}>
            <TableHead>
              <TableRow style={{ padding: "none" }}>
                <TableCell><h3>Category</h3></TableCell>
                <TableCell><h3>Item</h3></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataChecked.map((category, categoryIndex) =>
                category.items.map((item, itemIndex) => (
                  <TableRow key={`${categoryIndex}-${itemIndex}`}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{item.nom}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Modal>
    </ThemeProvider>
  );
}

export default Extract;
