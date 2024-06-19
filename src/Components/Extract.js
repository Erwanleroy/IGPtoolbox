import React from 'react';
//import data from '../Utils/donnees.json';
import { saveData, getData } from '../Utils/indexeddb';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const Extract = () => {
  // État local pour suivre les cases à cocher des éléments
  const [data, setData] = React.useState();
  const [categories, setCategories] = React.useState([]);
  const [itemCheckState, setItemCheckState] = React.useState({});
  const [isHovering, setIsHovering] = React.useState(false);
  const [newData, setNewData] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [alertText, setAlertText] = React.useState("");
  const [alertSeverity, setAlertSeverity] = React.useState("warning");
  const [alertVisible, setAlertVisible] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const timeoutRef = React.useRef(null); // Utilisation d'une ref pour stocker le timeout

  //CSS
  const blockImport = {
    position:"absolute",
    display:"flex",
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"center",
    padding:"1em",
    right:"3em", 
    top:"7em", 
    width:"6em",
    height:"6em",
    borderRadius:"1em",
    transitionDuration:".1s",
    borderBottom:"1px solid black",
  }

  const hoverBlockImport = {
    ...blockImport,
    transitionDuration:".1s",
    cursor:"pointer",
    transform:"scale(1.2)",
    backgroundColor: "#f0f0f0", // Couleur de fond au survol
  }

  const diviseur = {
    width: "1px",
    height: "100vh",
    backgroundColor: "#999",
    position: "fixed",
    left: "50%",
    top: "0",
    zIndex:"-999",
    bottom: "0"
  }

  const alertStyle = {
    position: 'fixed',
    bottom: '10px',
    zIndex: '9999',
    transform: alertVisible ? 'translateX(0)' : 'translateX(-100%)', 
    transition: 'transform .5s', 
}


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
    const originalDataForCheckedItems = getOriginalDataForCheckedItems(checkedItems);
    // Retourner l'ensemble des données originales une fois que la boucle est terminée
    return originalDataForCheckedItems;
  };

  const getOriginalDataForCheckedItems = (checkedItems) => {
    const result = [];
  
    // Pour chaque élément dans checkedItems, obtenir les détails complets et les regrouper par catégorie
    checkedItems.forEach(({ categoryId, itemId }) => {
      const category = data.categories.find(cat => cat.name === categoryId);
      if (category) {
        const item = category.items.find(item => item.id === parseInt(itemId));
        if (item) {
          let categoryResult = result.find(cat => cat.name === categoryId);
          if (!categoryResult) {
            categoryResult = { name: categoryId, items: [] };
            result.push(categoryResult);
          }
          categoryResult.items.push(item);
        }
      }
    });
  
    return result;
  };

//crée un fichier temporaire contenant les données
  const downloadJsonData = () => {
    let dataJson = getCheckedItems()
    if(dataJson.length === 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setAlertText("Aucun composant selectionné");
      setAlertSeverity("error")
      setAlertVisible(true);
      timeoutRef.current = setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
      return
    }
    const jsonContent = JSON.stringify(dataJson);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'donnees.json');
    document.body.appendChild(link);
    link.click();
  };

  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setNewData()
    setSelectedFile(file);
    if (file) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setAlertSeverity("error")
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension === 'json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileContent = e.target.result;
          try {
            const parsedContent = JSON.parse(fileContent);
            if (Array.isArray(parsedContent)) {
              const isFormatValid = parsedContent.every(item => {
                return item.name && Array.isArray(item.items);
              });
              if (isFormatValid) {
                setAlertText("Format du fichier valide 🎉");
                setAlertSeverity("success")
                setNewData(parsedContent);
              } else {
                setAlertText("Format du fichier invalide");
              }
            } else {
              setAlertText("Format du fichier invalide");
            }
          } catch (err) {
            setAlertText("Format du fichier invalide");
          }
        };
        reader.readAsText(file);
        setAlertVisible(true);
        timeoutRef.current = setTimeout(() => {
          setAlertVisible(false);
        }, 3000);
      } 
    }
  };
  const uploadJsonData = () => {
    if(newData===undefined || newData===""){
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setAlertText("Import impossible, données non valide");
      setAlertSeverity("error")
      setAlertVisible(true);
      timeoutRef.current = setTimeout(() => {
        setAlertVisible(false);
      }, 3000);  
      return  
    }
//controle des donnees puis creation d'un nouveau "categories avec mes nouvelles data"
    newData.forEach(newCategory => {
      // Recherche la catégorie correspondante dans les données brut
      const existingCategory = categories.find(category => category.name === newCategory.name);
      
      if (!existingCategory) {
        // Si la catégorie n'existe pas, ajoute-la avec l'item
        categories.push(newCategory);
      } else {
        // Si la catégorie existe, vérifie si l'item existe déjà dans cette catégorie
        const existingItem = existingCategory.items.find(item => item.nom === newCategory.items[0].nom);
        if (!existingItem) {
          // Ajoute l'item uniquement si il n'existe pas déjà dans la catégorie
          const newItem = { ...newCategory.items[0] };
          // Vérifie si l'ID de l'item n'est pas déjà pris dans la catégorie
          let itemIdExists = newCategory.items.find(item => item.id === newItem.id);
          
          // Si l'ID de l'item existe déjà, génère un nouvel ID par ordre croissant jusqu'à en trouver un disponible
          while (itemIdExists) {
            newItem.id++;
            itemIdExists = newCategory.items.find(item => item.id === newItem.id);
          }
          existingCategory.items.push(newItem);
    
        }else{
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setAlertText(existingCategory.name+"."+existingItem.nom+" déja présent");
          setAlertSeverity("error")
          setAlertVisible(true);
          timeoutRef.current = setTimeout(() => {
            setAlertVisible(false);
          }, 3000);           
        }
      }
    });
    saveDataIndexedDb({ categories: categories })
  }

  const handleLinkClick = () => {
    fileInputRef.current.click(); // Cliquer sur l'élément input de type file
  };


  React.useEffect(() => {
    // Charger les données depuis IndexedDB lors du montage du composant
    async function loadData() {
      const data = await getData();
      if (data) {
        setData(data)
        setCategories(data.categories)
      }
    }
    loadData();
  }, []);
  const saveDataIndexedDb = async () => {
    try {
      await saveData({categories: categories});
    } catch (error) {
      console.error("Error saving data to IndexedDB: ", error);
    }
  }

  return (
    <div style={{ textAlign: "left", marginBottom: "10vh"}}>
      <input  
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }} // Cacher visuellement l'élément input
        onChange={handleFileChange}
        />
      <div 
        style={isHovering ? hoverBlockImport : blockImport} 
        onMouseEnter={() => setIsHovering(true)} 
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleLinkClick}
        >
        <FileDownloadIcon style={{fontSize:"3em"}}/>
        <p style={{textAlign:"center"}}>Import file</p>
        <p style={{color:"green"}}>{selectedFile && `${selectedFile.name.slice(0, 6)}...${selectedFile.name.substring(selectedFile.name.lastIndexOf('.') + 1)}`}</p>
      </div>
      <Button
        variant="contained"
        style={{ position: "fixed", bottom: "0", right: "0", margin: "1em" }}
        onClick={uploadJsonData}
      >
        Merge
      </Button>

      <div style={diviseur}></div>

      {categories.map(category => (
          category.name !== "IGP ToolBox" && (
        <div key={category.name}>
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
      <Button
        variant="contained"
        style={{ position: "fixed", bottom: "0", left: "0", margin: "1em" }}
        onClick={downloadJsonData}
      >
        Extract
      </Button>

            <Alert 
                style={alertStyle} 
                variant="filled" 
                severity={alertSeverity}>
                {alertText}   
            </Alert>
    </div>
  );
}

export default Extract;
