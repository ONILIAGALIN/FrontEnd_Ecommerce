import React, { useState, useEffect, useRef } from 'react'
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating,Paper, InputBase,IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { DataGrid } from '@mui/x-data-grid'
import { index, store, update, destroy } from '../api/product'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useCookies } from 'react-cookie'
import {useNavigate} from 'react-router-dom'
import checkAuth from '../hoc/checkAuth'

function Product() {
  const user = useSelector(state => state.auth.user)
  const [products, setProducts] = useState([])
  const [createDialog, setCreateDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(null)
  const [selectedType, setSelectedType] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState(1)
  const [file, setFile] = useState(null)
  const [cookies] = useCookies();
  const createFormRef = useRef(null)
  const updateFormRef = useRef(null)
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editRate, setEditRate] = useState(editDialog?.rate ?? 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);


  const fetchProducts = () => {
  index().then(res => {
    if(res?.ok && Array.isArray(res.data)){
      setProducts(res.data.map(p => ({
        ...p,
        created_at: p.created_at,
        price_string: p.price?.toString(),
        rating: Number(p.rating) || 0   // <-- add this line
      })))
    } else if (Array.isArray(res)) {
      setProducts(res)
    } else {
      toast.error(res?.message ?? 'Something went wrong')
    }
  }).catch(err => {
    console.error('Failed to load products', err)
    toast.error('Failed to load products')
  })
}

useEffect(() => {
  const q = searchQuery.trim().toLowerCase();

  if (!q) {
    setFilteredProducts(products);
    return;
  }

  const filtered = products.filter(p =>
    (p.name ?? "").toLowerCase().includes(q) ||
    (p.description ?? "").toLowerCase().includes(q) ||
    (p.stock ?? "").toString().includes(q) ||
    (p.price ?? "").toString().includes(q)
  );

  setFilteredProducts(filtered);
}, [searchQuery, products]);


  const onCreate = (e) => {
    e.preventDefault()
    const form = createFormRef.current
    const fd = new FormData(form)
    fd.append('type', selectedType)
    if (file) fd.append('image', file)

    store(fd, cookies.AUTH_TOKEN).then(res => {
        console.debug('product store response', res)
        if (res?.ok) {
          toast.success(res?.message ?? 'Product has been created!')
          setCreateDialog(false)
          fetchProducts()
          return
        }

  const potentialErrors = res?.errors ?? res?.error ?? res?.messages ?? null
    if (potentialErrors) {
        const msgs = []
        if (Array.isArray(potentialErrors)) msgs.push(...potentialErrors.map(m => String(m)))
          else if (typeof potentialErrors === 'object') {
            for (const k of Object.keys(potentialErrors)) {
              const v = potentialErrors[k]
              if (Array.isArray(v)) msgs.push(...v.map(m => String(m)))
              else msgs.push(String(v))
            }
          } else msgs.push(String(potentialErrors))

          toast.error(msgs.join(' | '))
          console.warn('Product store validation errors', res)
          return
        }

        toast.error(res?.message ?? 'Something went wrong')
        console.log(res)
    }).catch(err => {
      console.error('Create failed', err)
      toast.error('Create failed')
    })
  }

  useEffect(() => {
  if(editDialog) setEditRate(editDialog.rating ?? 0);
}, [editDialog]);

  const onUpdate = (e) => {
    e.preventDefault()
    const form = updateFormRef.current
    const fd = new FormData(form)
    fd.append('type', selectedType)
    fd.append('status', selectedStatus)
    fd.append('rating', editRate);
    if (file) fd.append('image', file)

    update(fd, editDialog.id, cookies.AUTH_TOKEN).then(res => {
      console.debug('product update response', res)
      if (res?.ok) {
        toast.success(res?.message ?? 'Product has been updated!')
        setEditDialog(null)
        fetchProducts()
        return
      }

      const potentialErrors = res?.errors ?? res?.error ?? res?.messages ?? null
      if (potentialErrors) {
        const msgs = []
        if (Array.isArray(potentialErrors)) msgs.push(...potentialErrors.map(m => String(m)))
        else if (typeof potentialErrors === 'object') {
          for (const k of Object.keys(potentialErrors)) {
            const v = potentialErrors[k]
            if (Array.isArray(v)) msgs.push(...v.map(m => String(m)))
            else msgs.push(String(v))
          }
        } else msgs.push(String(potentialErrors))

        toast.error(msgs.join(' | '))
        console.warn('Product update validation errors', res)
        return
      }

      toast.error(res?.message ?? 'Something went wrong')
      console.log(res)
    }).catch(err => {
      console.error('Update failed', err)
      toast.error('Update failed')
    })
  }

  const onDelete = () => {
    if (!deleteDialog?.id) return
    setLoading(true)
    destroy(deleteDialog.id, cookies.AUTH_TOKEN)
      .then(res => {
        if (res?.ok) {
          toast.success(res?.message ?? 'Product deleted!')
          setDeleteDialog(null)
          fetchProducts()
        } else {
          toast.error(res?.message ?? 'Failed to delete product')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if(!!editDialog){
      setSelectedType(editDialog.type)
      setSelectedStatus(editDialog.status)
    }
    else if(!editDialog && !createDialog){
      setSelectedType(1)
      setSelectedStatus(1)
      setFile(null)
    }
  }, [editDialog, createDialog])

  const navigate = useNavigate()

  useEffect(() => {
  if (!user) return;

  if (user.role !== 'admin') {
    toast.error("You are not authorized to view this page");
    navigate("/");
    return;
  }

  fetchProducts();
}, [user]);

  const columns = [
    {field: 'id', headerName: 'ID'},
    {field: 'name', headerName: 'Product', flex: 1},
    {field: 'description', headerName: 'Description', flex: 2},
    {field: 'price_string', headerName: 'Price',flex: 1},
    {field: 'stock', headerName: 'Stock',flex: 1},
    {field: 'rating', headerName: 'Ratings', flex: 1},
    {field: 'created_at', headerName: 'Created At', flex: 1},
    {
      field: "actions", headerName: "Actions", sortable: false, filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center", height: "100%" }}>
          <Button onClick={() => setEditDialog({ ...params.row })} variant="contained" color='warning'>Edit</Button>
          <Button variant="contained" color="error" onClick={() => setDeleteDialog({ id: params.row.id, name: params.row.name })}> Delete </Button>
        </Box>
      ), minWidth: 200, hideable: false, flex: 0,
    },
  ];
  return (
    <Box sx={{mt: 2}}>
      <Box sx={{display: "flex", justifyContent: 'space-between', pr: 2, pl: 2}}>
        <Typography variant="h5" sx={{mb:4, color:"tomato"}}>
          Titan Tools Products
        </Typography>
        <Paper component="form" sx={{ display: 'flex', alignItems: 'center', width: 550, height: 30, p: '2px 4px' }} onSubmit={e => e.preventDefault()}>
              <InputBase sx={{ ml: 1, flex: 1, color:'black' }} placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            </Paper>
        <Box>
          <Button variant="contained" color="success" onClick={() => setCreateDialog(true)}>Create</Button>
        </Box>
      </Box>
      <DataGrid
        columns={columns} rows={filteredProducts} sx={{ mt: 2, height: "calc(100vh - 150px)" // adjust kung gusto mo mas baba
        }} />
      <Dialog open={createDialog}>
        <DialogTitle sx={{color:"tomato"}}>
          Create Product
        </DialogTitle>
        <DialogContent>
          <Box ref={createFormRef} onSubmit={onCreate} component="form" encType='multipart/form-data' id="create-form">
            <TextField name="name" id="name" required label="Product " sx={{mt: 1}} size="small" fullWidth />
            <TextField name="description" id="input_description" label="Description" multiline maxRows={4} sx={{mt: 1}} size="small" fullWidth />
            <TextField name="stock" id="input_description" label="stock" multiline maxRows={4} sx={{mt: 1}} size="small" fullWidth />
            <TextField name="price" id="input_price" required label="Price" sx={{mt: 1}} size="small" type="number" InputProps={{min: 1, max: 1000000000}} fullWidth />
            <TextField name="rating" id="input_rating" label="rating" multiline maxRows={4} sx={{mt: 1}} size="small" fullWidth />
            <Box sx={{mt: 2}}>
              <input onChange={(e) => setFile(e.target.files[0])} name="image" type="file" />
            </Box>
            <Button id="create_submit" type="submit" sx={{display: 'none'}} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={() => createFormRef.current?.requestSubmit()}>Create</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!editDialog}>
        <DialogTitle sx={{color:"tomato"}}>
          Edit Product
        </DialogTitle>
        <DialogContent>
          <Box ref={updateFormRef} onSubmit={onUpdate} component="form" encType='multipart/form-data' id="update-form">
            <TextField defaultValue={editDialog?.name} name="name" id="input_name" required label="Product" sx={{mt: 1}} size="small" fullWidth />
            <TextField defaultValue={editDialog?.description} name="description" id="input_description" label="Description" multiline maxRows={4} sx={{mt: 1}} size="small" fullWidth />
            <TextField defaultValue={editDialog?.price} name="price" id="input_price" required label="Price" sx={{mt: 1}} size="small" type="number" InputProps={{min: 1, max: 1000000000}} fullWidth />
            <TextField defaultValue={editDialog?.stock} name="stock" id="input_stock" label="Stock" multiline maxRows={4} sx={{mt: 1}} size="small" fullWidth /><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <Typography>Rating:</Typography>
              <Rating name={`edit-product-rating-${editDialog?.id}`} value={editRate} precision={0.5} onChange={(e, newValue) => setEditRate(newValue)}/>
            </Box>
            </Box>
            <Box sx={{mt: 2}}>
              <input onChange={(e) => setFile(e.target.files[0])} name="image" type="file" />
            </Box>
            <Button id="update_submit" type="submit" sx={{display: 'none'}} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(null)}>Cancel</Button>
          <Button onClick={() => updateFormRef.current?.requestSubmit()}>Update</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog?.name}" (ID: {deleteDialog?.id})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1 }}>
          <Button onClick={() => setDeleteDialog(null)} sx={{ backgroundColor: '#26A338', color: 'white' }}> Cancel </Button>
          <Button onClick={onDelete} disabled={loading} sx={{ backgroundColor: '#E71717', color: 'white' }}> Confirm </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}


export default checkAuth(Product)