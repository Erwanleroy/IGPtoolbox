import React from 'react';
import data from '../Utils/donnees.json';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const Extract = () => {
  const categories = data.categories;
  // État local pour suivre les cases à cocher des éléments
  const [itemCheckState, setItemCheckState] = React.useState({});

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
    const jsonContent = JSON.stringify(dataJson);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'donnees.json');
    document.body.appendChild(link);
    link.click();
  };


  return (
    <div style={{ textAlign: "left" }}>
      <FileDownloadIcon style={{position:"absolute", right:"1em", top:"2em", fontSize:"3em"}}/>
      {categories.map(category => (
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
      ))}
      <Button
        variant="outlined"
        style={{ position: "absolute", bottom: "0", left: "0", margin: "1em" }}
        onClick={downloadJsonData}
      >
        Extract
      </Button>
    </div>
  );
}

export default Extract;
