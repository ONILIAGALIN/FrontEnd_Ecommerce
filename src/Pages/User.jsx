import React, { useEffect, useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, CircularProgress, Paper, InputBase, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import { useSelector } from 'react-redux'
import checkAuth from '../hoc/checkAuth'
import { DataGrid } from '@mui/x-data-grid'
import { useCookies } from 'react-cookie'
import { destroy, index, store, update } from '../api/user'
import $ from 'jquery'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

function Users() {
  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [warnings, setWarnings] = useState({})
  const [loading, setLoading] = useState(false)
  const [createDialog, setCreateDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(null)
  const [editDialog, setEditDialog] = useState(null)
  const user = useSelector(state => state.auth.user)
  const [cookies] = useCookies()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    address: '',
    phone_number: ''
  })

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Username', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'first_name', headerName: 'First name', flex: 1 },
    { field: 'middle_name', headerName: 'Middle name', flex: 1 },
    { field: 'last_name', headerName: 'Last name', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'phone_number', headerName: 'Phone Number', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      renderCell: params => (
        <Box sx={{ display: 'flex',  flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.5, sm: 1 },  justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Button onClick={() => setEditDialog({ ...params.row })} variant="contained" color="warning" sx={{ width: { xs: '100%', sm: 'auto' } }}>Edit</Button>
          <Button onClick={() => setDeleteDialog(params.row.id)} variant="contained" color="error" sx={{ width: { xs: '100%', sm: 'auto' } }}>Delete</Button>
        </Box>
      ),
      minWidth: 200,
      hideable: false
    }
  ]

  const refreshData = () => {
    if (!user) return
    if (user.role !== 'admin') {
      toast.error("You are not authorized to view this page")
      navigate("/")
      return
    }

    index(cookies.AUTH_TOKEN).then(res => {
      if (res?.ok) {
        const data = Array.isArray(res.data) ? res.data : []
        const mapped = data.map(d => ({ ...d, ...d.profile }))
        setRows(mapped)
        setFilteredRows(mapped)
        return
      }

      if (res?.status === 401 || res?.status === 403) {
        toast.error("Unauthorized: your session may have expired. Please login again.")
        return
      }

      toast.error(res?.message ?? "Something went wrong.")
      console.warn('Failed to load users:', res)
    }).catch(err => {
      console.error(err)
      toast.error("Failed to fetch users.")
    })
  }

  useEffect(() => {
    refreshData()
  }, [user])
  useEffect(() => {
    const q = (searchQuery ?? '').trim().toLowerCase()
    if (!q) {
      setFilteredRows(rows)
      return
    }

    setFilteredRows(
      rows.filter(u =>
        (u.name ?? '').toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.first_name ?? '').toLowerCase().includes(q) ||
        (u.last_name ?? '').toLowerCase().includes(q) ||
        (u.role ?? '').toLowerCase().includes(q)
      )
    )
  }, [searchQuery, rows])

 const onCreate = (e) => {
  e.preventDefault()
  if (!loading) {
    setLoading(true)

    const payload = {
      name: createForm.name || '',
      email: createForm.email || '',
      password: createForm.password || '',
      password_confirmation: createForm.password_confirmation || '',
      first_name: createForm.first_name || '',
      last_name: createForm.last_name || '',
      address: createForm.address || '',
      phone_number: createForm.phone_number || '',
    }

    store(payload, cookies.AUTH_TOKEN)
      .then(res => {
        if (res?.ok) {
          toast.success(res?.message ?? "Account has been Created")
          setCreateDialog(false)
          setWarnings({})
          setCreateForm({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            address: '',
            phone_number: ''
          })
          refreshData()
        } else {
          toast.error(res?.message ?? "Something went wrong")
          setWarnings(res?.errors ?? {})
        }
      })
      .finally(() => setLoading(false))
  }
}

  const onDelete = () => {
    if (!loading) {
      setLoading(true)
      destroy(deleteDialog, cookies.AUTH_TOKEN).then(res => {
        if (res?.ok) {
          toast.success(res?.message ?? "User has been deleted")
          refreshData()
          setDeleteDialog(null)
        } else {
          toast.error(res?.message ?? "Something went wrong.")
        }
      }).finally(() => {
        setLoading(false)
      })
    }
  }

  const onEdit = e => {
    e.preventDefault()
    if (!loading && editDialog) {
      setLoading(true)
      const payload = {
        first_name: editDialog.first_name,
        middle_name: editDialog.middle_name?.trim() ?? "",
        last_name: editDialog.last_name,
        address: editDialog.address,
        phone_number: editDialog.phone_number,
        role: editDialog.role,
      }
      update(payload, editDialog.id, cookies.AUTH_TOKEN).then(res => {
        if (res?.ok) {
          toast.success(res?.message ?? "User has been Updated.")
          refreshData()
          setEditDialog(null)
        } else {
          toast.error(res?.message ?? "Something went wrong.")
        }
      }).finally(() => {
        setLoading(false)
      })
    }
  }

  return (
    <Box>
      {user ? (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' },  alignItems: { xs: 'stretch', sm: 'center' },  justifyContent: 'space-between', gap:2, px: 2 }}>
            <Typography variant="h5" sx={{ mb: { xs: 2, sm: 0 }, color: "tomato" }}>
              Titan User's List.
            </Typography>
            <Paper component="form" sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: '60%', md: '40%' },  p: '2px 4px'  }} onSubmit={e => e.preventDefault()}>
              <InputBase sx={{ ml: 1, flex: 1, color:'black' }} placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            </Paper>
            <Box>
              <Button variant="contained" color="success" sx={{ width: { xs: '100%', sm: 'auto' } }}  onClick={() => setCreateDialog(true)}>Create</Button>
            </Box>
          </Box>

          <DataGrid
            sx={{ mt: 1, color: 'black',  flexGrow: 1, minHeight: 400 }} columns={columns} rows={filteredRows} pageSize={10} rowsPerPageOptions={[10, 25, 50]}disableSelectionOnClick getRowId={(row) => row.id}/>
          {/* Create Dialog */}
          <Dialog open={createDialog} fullWidth maxWidth="sm">
            <DialogTitle sx={{ color: "tomato" }}>Create User</DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={onCreate} sx={{ width: 300, mx: 'auto' }}>
                <Box sx={{ mt: 1 }}>
                  <TextField required id="name" fullWidth size="small" label="User name" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })}/>
                  {warnings?.name ? (
                    <Typography sx={{ fontSize: 12 }} component="small" color="error"> {warnings.name} </Typography>
                  ) : null}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField required id="email" fullWidth size="small" label="Email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })}/>
                  {warnings?.email ? (
                    <Typography sx={{ fontSize: 12 }} component="small" color="error"> {warnings.email} </Typography>
                  ) : null}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField required id="password" fullWidth size="small" label="Password" type='password' value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })}/>
                  {warnings?.password ? (
                    <Typography sx={{ fontSize: 12 }} component="small" color="error"> {warnings.password} </Typography>
                  ) : null}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField required id="password_confirmation" fullWidth size="small" type='password' label="Password Confirmation" value={createForm.password_confirmation} onChange={e => setCreateForm({ ...createForm, password_confirmation: e.target.value })}/>
                  {warnings?.password_confirmation ? (
                    <Typography sx={{ fontSize: 12 }} component="small" color="error"> {warnings.password_confirmation} </Typography>
                  ) : null}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField required id="first_name" fullWidth size="small" label="first Name" value={createForm.first_name} onChange={e => setCreateForm({ ...createForm, first_name: e.target.value })}/>
                  {warnings?.first_name ? (
                    <Typography sx={{ fontSize: 12 }} component="small" color="error"> {warnings.first_name} </Typography>
                  ) : null}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField id="middle_name" fullWidth size="small" label="Middle Name" value={createForm.middle_name} onChange={e => setCreateForm({ ...createForm, middle_name: e.target.value })}/>
                  {warnings?.middle_name ? (
                    <Typography sx={{ fontSize: 12 }} component="small" color="error"> {warnings.middle_name} </Typography>
                  ) : null}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField required id="last_name" fullWidth size="small" label="Last Name" value={createForm.last_name} onChange={e => setCreateForm({ ...createForm, last_name: e.target.value })}/>
                  {warnings?.last_name ? (
                    <Typography sx={{ fontSize: 12 }} component="small" color="error"> {warnings.last_name} </Typography>
                  ) : null}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField required id="address" fullWidth size="small" label="Address" value={createForm.address} onChange={e => setCreateForm({ ...createForm, address: e.target.value })}/>
                  {warnings?.address ? (
                    <Typography sx={{ fontSize: 12 }} component="small" color="error"> {warnings.address} </Typography>
                  ) : null}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField required id="phone_number" fullWidth size="small" label="Phone Number" value={createForm.phone_number} onChange={e => setCreateForm({ ...createForm, phone_number: e.target.value })}/>
                  {warnings?.phone_number ? (
                    <Typography sx={{ fontSize: 12 }} component="small" color="error"> {warnings.phone_number} </Typography>
                  ) : null}
                </Box>
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Button id="submit_btn" disabled={loading} type="submit" sx={{ display: 'none' }}></Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialog(false)} color="info">Close</Button>
              <Button onClick={() => { $("#submit_btn").trigger("click") }}>Create</Button>
            </DialogActions>
          </Dialog>
          {/* Delete Dialog */}
          <Dialog open={!!deleteDialog}>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogContent>
              <Typography>Do you want to delete this user with ID: {deleteDialog}?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
              <Button disabled={loading} onClick={onDelete}>Confirm</Button>
            </DialogActions>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={!!editDialog}>
            <DialogTitle sx={{ color: "tomato" }}>Edit User</DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={onEdit} sx={{ p: 1 }}>
                <Box sx={{ mt: 0 }}>
                  <TextField onChange={e => setEditDialog({ ...editDialog, first_name: e.target.value })} value={editDialog?.first_name ?? ""} size="small" fullWidth label="First name" />
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField onChange={e => setEditDialog({ ...editDialog, middle_name: e.target.value })} value={editDialog?.middle_name ?? ""} size="small" fullWidth label="Middle name" />
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField onChange={e => setEditDialog({ ...editDialog, last_name: e.target.value })} value={editDialog?.last_name ?? ""} size="small" fullWidth label="Last name" />
                </Box>
                {/* Role select */}
                <Box sx={{ mt: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select value={editDialog?.role ?? ""} label="Role" onChange={e => setEditDialog({ ...editDialog, role: e.target.value })}>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="customer">Customer</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField onChange={e => setEditDialog({ ...editDialog, address: e.target.value })} value={editDialog?.address ?? ""} size="small" fullWidth label="Address" />
                </Box>
                <Box sx={{ mt: 1 }}>
                  <TextField onChange={e => setEditDialog({ ...editDialog, phone_number: e.target.value })} value={editDialog?.phone_number ?? ""} size="small" fullWidth label="Phone Number" type="text" />
                </Box>
                <Button id="edit-btn" type="submit" sx={{ display: "none" }} />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialog(null)}>Close</Button>
              <Button disabled={loading} onClick={onEdit}>Update</Button>
            </DialogActions>
          </Dialog>
        </Box>
      ) : null}
    </Box>
  )
}

export default checkAuth(Users)
