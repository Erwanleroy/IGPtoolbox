// Home.js
import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { Button, Stack,Box } from '@mui/material';
import { getData } from '../Utils/indexeddb';

const Home = () => {
  let MUI_X_PRODUCTS = [
    {
      id: 'grid',
      label: 'Documentation',
      children: [
      ],
    },
    {
      id: 'pickers',
      label: 'Parameters',
      children: [
        { id: 'addItemAddOrRemove', label: 'Add or Remove Item' },
        { id: 'Extract', label: 'Import or Export Item' },
      ],
    },
  ];
  const getAllItemsWithChildrenItemIds = () => {
    const itemIds = [];
    const registerItemId = (item) => {
      if (item.children?.length) {
        itemIds.push(item.id);
        item.children.forEach(registerItemId);
      }
    };

    MUI_X_PRODUCTS.forEach(registerItemId);

    return itemIds;
  };
  
  //const test={"categories":[{"name":"IGP ToolBox","items":[{"id":1,"nom":"RAS","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"RASSSSSS.","code":"ls -la"}]},{"name":"Linux","items":[{"id":1,"nom":"Kernel","image":"https://i.seadn.io/gae/2hDpuTi-0AMKvoZJGd-yKWvK4tKdQr_kLIpB_qSeMau2TNGCNidAosMEvrEXFO9G6tmlFlPQplpwiqirgrIPWnCKMvElaYgI-HiVvXc?auto=format&dpr=1&w=1000","desc":"The Linux kernel is the core component of the Linux operating system.","code":"uname -a"},{"id":2,"nom":"Bash","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Bash is a Unix shell and command language.","code":"echo 'Hello, World!'"},{"id":3,"nom":"Bitsh","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Bash is a Unix shell and command language.","code":"echo 'Hello, World!'"},{"id":4,"nom":"TEST2","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Bash is a Unix shell and command language.","code":"echo 'Hello, World!'"}]},{"name":"MQseries","items":[{"id":1,"nom":"Queue Management","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Manage message queues with MQSeries.","code":"dspmq"}]},{"name":"CFT","items":[{"id":1,"nom":"File Operations","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Operations related to file systems.","code":"ls -la"},{"id":2,"nom":"TEST","image":"https://thumbs.dreamstime.com/z/random-click-squirrel-wire-random-picture-cute-squirrel-219506797.jpg?ct=jpeg","desc":"Operations related to file systems.","code":"ls -la"}]}]}
  const [ totalData, setTotalData ] = React.useState([])
  const [expandedItems, setExpandedItems] = React.useState([]);

  async function loadData() {
    const data = await getData();
    if (data) {
      console.log(data)
      let dataFromBdd = data.categories
      .filter(category => category.name !== "IGP ToolBox") // Exclure la catégorie "IGP ToolBox"
      .map((category, index) => {
        return {
          id: index,               // Identifiant unique basé sur l'index
          value: category.items.length,  // Nombre d'items dans cette catégorie
          label: category.name     // Nom de la catégorie
        };
      });
      setTotalData(dataFromBdd)
    }
  }

  const handleExpandedItemsChange = (event, itemIds) => {
    setExpandedItems(itemIds);
  };

  React.useEffect(() => {
    loadData(); // Appeler loadData uniquement lors du premier rendu
  }, []);

  return (
    <div>

      <Stack spacing={2} style={{ textAlign:"left", position:"absolute"}}>
      <Box sx={{ minHeight: 352, minWidth: 250 }} >
          <RichTreeView
            items={MUI_X_PRODUCTS}
            expandedItems={expandedItems}
            onExpandedItemsChange={handleExpandedItemsChange}
          />
        </Box>
      </Stack>
      <h1>Total documentation :</h1>

      <PieChart
        series={[
          {
            data:totalData,
            innerRadius: 30,
            paddingAngle: 5,
            cornerRadius: 5,
            highlightScope: { faded: 'global', highlighted: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
          },
        ]}
        height={200}
        />

      </div>
  )
}

export default Home