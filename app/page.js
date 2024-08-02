'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import {firestore} from "@/firebase"
import { Box, Modal, Stack, Typography, TextField, Button } from "@mui/material";
import {collection, deleteDoc, doc, getDocs, query, getDoc, setDoc} from 'firebase/firestore'

export default function Home() {
  // variables for managing inventory, modal open state, item name input, & search query
  const [inventory, setInventory]=useState([])
  const [open, setOpen]=useState(false)
  const [itemName, setItemName]=useState('')
  const [searchQuery, setSearchQuery] = useState('');
  
  // fetches inventory data from firestore and updates state
  const updateInventory=async ()=>{
    const snapshot =query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList=[]
    docs.forEach((doc)=>{
      inventoryList.push({
        name : doc.id,
        ...doc.data(), 
      })
    })
    setInventory(inventoryList)
  }

  // removes an item from the inventory
  const removeItem = async (item) =>{
    const docRef = doc(collection(firestore,'inventory'),item)
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if(quantity ===1){
        await deleteDoc(docRef)

      }
      else{
        await setDoc(docRef, {quantity:quantity-1})
      }
    }
    await updateInventory()
  }

  // adds an item to the inventory
  const addItem = async (item) =>{
    const docRef = doc(collection(firestore,'inventory'),item)
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity:quantity+1})
      
    }
    else{
      await setDoc(docRef, {quantity:1})
    }
    await updateInventory()
  }

  // effect hook to fetch inventory data on component mount
  useEffect(()=>{
    updateInventory()
  }, [])

  // handles modal open and close states
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  // filters the inventory based on the search
  const filteredInventory = inventory.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));


  return (
    <Box 
    width ="100vw" 
    height = "100vh" 
    display ="flex" 
    flexDirection="column"
    justifyContent="center"
    alignItems="center" 
    gap ={2}
    bgcolor="white"
    >
      
      {/* modal that adds the new items */}
      <Modal
        open = {open}
        onCloe={handleClose}>
          <Box 
          position ="absolute" 
          top="50%" 
          left = "50%"
          width = {400}
          bgcolor = "#f0f0f0"
          border = "2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx = {{
            transform :"translate(-50%,-50%)"
          }}
          >

            <Typography 
              variant = "6"
              sx={{ 
                fontFamily: 'Palatino, serif' ,
                color:"#333"
              }}
            >
              Add Item
            </Typography>

            <Stack width = "100%" direction="row" spacing ={2}>
              <TextField
              variant = 'outlined'
              fullWidth
              value = {itemName}
              onChange={(e)=>{
                setItemName(e.target.value)
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'lightblue', 
                  },
                  '&:hover fieldset': {
                    borderColor: 'cyan', 
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'lightblue', 
                  },
                },
              }}
              />

              <Button
                variant = "outlined" 
                sx={{ 
                  fontFamily: 'Palatino, serif',
                  color: "#333",
                  borderColor:"lightblue",
                  '&:hover': {
                    borderColor: 'cyan',
                  }  
                }}
                
                onClick={()=>{
                  addItem(itemName)
                  setItemName('')
                  handleClose()
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
      </Modal>
    

      {/* button that opens the modal to add new items */}
      <Button 
        variant = "contained" 
        sx={{
          backgroundColor: 'lightblue', 
          color:'black',
          fontFamily: 'Palatino, sans-serif', 

          '&:hover': {
            backgroundColor: 'cyan',
          },
        }}
        onClick={()=>{
          handleOpen()
      }}>
        Add New Item
      </Button>

      {/* search field to filter items in the inventory */}
      <TextField
        label="Search Items"
        InputLabelProps={{
          sx: {
            fontFamily: 'Palatino, serif', 
            color: 'lightblue',
            '&.Mui-focused': {
              color: 'lightblue',
            },
          },
        }}
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ 
          marginBottom: 2, 
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'lightblue',
            },
            '&:hover fieldset': {
              borderColor: 'cyan',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'lightblue',
            },
          }
        }}
      />


      {/* the inventory items list */}
      <Box border="1px solid #333">
        <Box
        width = "800px" 
        height="100px"
        bgcolor = "lightblue"
        display = "flex"
        alignItems="center"
        justifyContent="center"
        >
          <Typography 
            variant = "h2" 
            color="#333"
            sx={{ 
              fontFamily: 'Palatino, serif'
            }}
          >
            Inventory Items
          </Typography>
        </Box>

        <Stack width = "800px" height = "300px" spacing ={2} overflow="auto">
          
          {filteredInventory.map(({name,quantity})=>(
              // inventory item box 
              <Box 
                key = {name} 
                width ="100%" 
                minHeight="150px" 
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#f0f0f0"
                padding = {5}
              >

                {/* item name */} 
                <Typography 
                  variant = "h3" 
                  color = "#333" 
                  textAlign="center" 
                  sx={{ 
                    fontFamily: 'Palatino, serif' 
                  }}
                >
                  {name.charAt(0).toUpperCase()+name.slice(1)}
                </Typography>

                {/* item quantity */} 
                <Typography 
                  variant = "h3" 
                  color = "#333" 
                  textAlign="center"
                  sx={{ 
                    fontFamily: 'Palatino, serif' 
                  }}
                  >
                  {quantity}
                </Typography>

                  <Stack direction ="row" spacing = {2}>

                    {/* button to add items from inventory */} 
                    <Button 
                      variant = "contained" 
                      sx={{
                        backgroundColor: 'lightblue', 
                        color:'black',
                        fontFamily: 'Palatino, sans-serif', 
                        '&:hover': {
                          backgroundColor: 'cyan', 
                        },
                      }}
                      onClick= {()=>{
                        addItem(name)
                      }}
                    >
                      Add
                    </Button>


                  {/* button to remove items from inventory */} 
                    <Button 
                      variant = "contained" 
                      sx={{
                        backgroundColor: 'lightblue', 
                        color:'black',
                        fontFamily: 'Palatino, sans-serif', 
                        '&:hover': {
                          backgroundColor: 'cyan', 
                        },
                      }}
                      onClick= {()=>{
                        removeItem(name)
                      }}
                    >
                      Remove
                    </Button>
                </Stack>

              </Box>
            ))}
        </Stack>
      </Box>
    </Box>


  );
}
