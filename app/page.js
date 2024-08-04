'use client';
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Stack, Typography, TextField, Button } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from "firebase/firestore";

export default function Home() {
  // variables for managing inventory, modal open state, item name input, initial quantity, search query, confirmation modal, and edit modal
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1); // State for initial quantity
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [editItem, setEditItem] = useState(null); // State for item being edited

  // fetches inventory data from firestore and updates state
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  // removes an item from the inventory
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        // open confirmation modal if the quantity is 1
        setItemToRemove(item);
        setConfirmOpen(true);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
        await updateInventory();
      }
    }
  };

  // confirms the removal of the last item
  const confirmRemoveItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemToRemove);
    await deleteDoc(docRef);
    await updateInventory();
    setConfirmOpen(false);
    setItemToRemove(null);
  };

  // cancels the removal of the last item
  const cancelRemoveItem = () => {
    setConfirmOpen(false);
    setItemToRemove(null);
  };

  // adds an item to the inventory
  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity });
    } else {
      await setDoc(docRef, { quantity });
    }
    await updateInventory();
  };

  // updates an item in the inventory
  const updateItem = async (oldName, newName, quantity) => {
    if (oldName !== newName) {
      await deleteDoc(doc(collection(firestore, 'inventory'), oldName));
    }
    await setDoc(doc(collection(firestore, 'inventory'), newName), { quantity });
    await updateInventory();
  };

  // deletes an item from the inventory
  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef);
    await updateInventory();
    handleEditClose();
  };

  // effect hook to fetch inventory data on component mount
  useEffect(() => {
    updateInventory();
  }, []);

  // handles modal open and close states
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName('');
    setItemQuantity(0);
  };

  // handles edit modal open states
  const handleEditOpen = (item) => {
    setEditItem(item);
    setItemName(item.name);
    setItemQuantity(item.quantity);
    setEditOpen(true);
  };

  // handles edit modal close states
  const handleEditClose = () => {
    setEditOpen(false);
    setEditItem(null);
    setItemName('');
    setItemQuantity(0);
  };

  // filters the inventory based on the search
  const filteredInventory = inventory.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      bgcolor="white"
    >
      {/* modal that adds the new items */}
      <Modal
        open={open}
        onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="#f0f0f0"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Palatino, serif',
              color: "#333"
            }}
          >
            Add Item
          </Typography>
          
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              variant='outlined'
              label="Item Name"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
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

            <TextField
              variant='outlined'
              label="Quantity"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => {
                setItemQuantity(Number(e.target.value));
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
              variant="outlined"
              sx={{
                fontFamily: 'Palatino, serif',
                color: "#333",
                borderColor: "lightblue",
                '&:hover': {
                  borderColor: 'cyan',
                }
              }}
              onClick={() => {
                addItem(itemName, itemQuantity);
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>


      {/* modal that edits the item details */}
      <Modal
        open={editOpen}
        onClose={handleEditClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="#f0f0f0"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Palatino, serif',
              color: "#333"
            }}
          >
            Edit Item
          </Typography>

          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              variant='outlined'
              label="Item Name"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
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

            <TextField
              variant='outlined'
              label="Quantity"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => {
                setItemQuantity(Number(e.target.value));
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

            <Stack direction ="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                sx={{
                  fontFamily: 'Palatino, serif',
                  color: "#333",
                  borderColor: "lightblue",
                  '&:hover': {
                    borderColor: 'cyan',
                  }
                }}
                onClick={() => {
                  updateItem(editItem.name, itemName, itemQuantity);
                  handleEditClose();
                }}
              >
                Save
              </Button>

              <Button
                variant="outlined"
                sx={{
                  fontFamily: 'Palatino, serif',
                  backgroundColor: '#f0f0f0',

                  color: "#333",
                  borderColor: "lightblue",
                  '&:hover': {
                    borderColor: 'cyan',
                  }
                }}
                onClick={() => {
                  deleteItem(editItem.name);
                }}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>


      {/* confirmation modal */}
      <Modal
        open={confirmOpen}
        onClose={cancelRemoveItem}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="#f0f0f0"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Palatino, serif',
              color: "#333"
            }}
          >
            Confirm Removal
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Palatino, serif',
              color: "#333"
            }}
          >
            Are you sure you want to remove the last of this item from the inventory?
          </Typography>
          <Stack width="100%" direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'lightblue',
                color: 'black',
                fontFamily: 'Palatino, sans-serif',
                '&:hover': {
                  backgroundColor: 'cyan',
                }
              }}
              onClick={confirmRemoveItem}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'lightblue',
                color: 'black',
                fontFamily: 'Palatino, sans-serif',
                '&:hover': {
                  backgroundColor: 'cyan',
                }
              }}
              onClick={cancelRemoveItem}
            >
              No
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* button that opens the modal to add new items */}
      <Button
        variant="contained"
        sx={{
          backgroundColor: 'lightblue',
          color: 'black',
          fontFamily: 'Palatino, sans-serif',
          '&:hover': {
            backgroundColor: 'cyan',
          },
        }}
        onClick={() => {
          handleOpen();
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
          width="800px"
          height="80px"
          bgcolor="lightblue"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h4"
            color="#333"
            sx={{
              fontFamily: 'Palatino, serif'
            }}
          >
            Inventory Items!
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {filteredInventory.map(({ name, quantity }) => (
            // inventory item box 
            <Box
              key={name}
              width="100%"
              minHeight="50px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={2}
            >
              {/* item name */}
              <Box flex={1}>
                <Typography
                  variant="h5"
                  color="#333"
                  textAlign="left"
                  sx={{
                    fontFamily: 'Palatino, serif',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
              </Box>

              {/* item quantity */}
              <Box flexShrink={0} width="50px" textAlign="center" sx={{ marginRight: 30 }}>
                <Typography
                  variant="h5"
                  color="#333"
                  sx={{
                    fontFamily: 'Palatino, serif'
                  }}
                >
                  {quantity}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexShrink={0}>
                {/* button to add items from inventory */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: 'lightblue',
                    color: 'black',
                    fontFamily: 'Palatino, sans-serif',
                    fontSize: '12px',
                    padding: '4px 15px',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'cyan',
                    },
                  }}
                  onClick={() => {
                    addItem(name, 1);
                  }}
                >
                  +
                </Button>

                {/* button to remove items from inventory */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: 'lightblue',
                    color: 'black',
                    fontFamily: 'Palatino, sans-serif',
                    fontSize: '12px',
                    padding: '4px 15px',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'cyan',
                    },
                  }}
                  onClick={() => {
                    removeItem(name);
                  }}
                >
                  -
                </Button>

                {/* button to edit item */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: 'lightblue',
                    color: 'black',
                    fontFamily: 'Palatino, sans-serif',
                    fontSize: '12px',
                    padding: '4px 11px',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'cyan',
                    },
                  }}
                  onClick={() => {
                    handleEditOpen({ name, quantity });
                  }}
                >
                  ✏️
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
