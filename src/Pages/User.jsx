import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, CircularProgress } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import checkAuth from '../hoc/checkAuth'
import { DataGrid } from '@mui/x-data-grid'
import { useCookies } from 'react-cookie'
import { destroy, index, store, update } from '../api/user'
import $ from 'jquery'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

function Users() {
  const [rows, setRows] = useState([])
  const [warnings, setWarnings] = useState({})
  const [loading, setLoading] = useState(false)
  const [createDialog, setCreateDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(null)
  const [editDialog, setEditDialog] = useState(null)
  const user = useSelector(state => state.auth.user)
  const [cookies, setCookie, removeCookie] = useCookies()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', password: '', password_confirmation: '',
    first_name: '', middle_name: '', last_name: '',
    address: '', phone_number: ''
  })

  const columns =[
    {field: 'id', headerName: 'ID'},
    {field: 'name', headerName: 'Username', flex: 1},
    {field: 'email', headerName: 'Email', flex: 1},
    {field: 'first_name', headerName: 'First name', flex: 1},
    {field: 'middle_name', headerName: ' Middle name', flex: 1},
    {field: 'last_name', headerName: 'Last name', flex: 1},
    {field: 'address', headerName: 'Address', flex: 1},
    {field: 'phone_number', headerName: 'phone Number',flex: 1},
    {field: 'actions', headerName: '', sortable:false, filterable:false, renderCell: params => (
      <Box sx={{display: 'flex', gap: 1, justifyContent: 'center', alignItems:'center', height:'100%'}}>
        <Button onClick={() => setEditDialog({...params.row})} variant="contained" color="warning">Edit</Button>
        <Button onClick={() => setDeleteDialog(params.row.id)} variant="contained" color="error">Delete</Button>
      </Box>
    ),minWidth: 200, hideable: false}
    
  ]
  const refreshData = () => {
  if (!user) return; // wait for user to load

  
  if (user.role !== 'admin') {
    toast.error("You are not authorized to view this page");
    navigate("/");
    return;
  }

  index(cookies.AUTH_TOKEN).then(res => {
    if (res?.ok) {
      const data = Array.isArray(res.data) ? res.data : [];
      setRows(data.map(d => ({ ...d, ...d.profile })));
      return;
    }

    if (res?.status === 401 || res?.status === 403) {
      toast.error("Unauthorized: your session may have expired. Please login again.");
      return;
    }

    toast.error(res?.message ?? "Something went wrong.");
    console.warn("Failed to load users:", res);
  });


    index(cookies.AUTH_TOKEN).then(res => {
      console.debug('users.index response', res)
      if(res?.ok){
        const data = Array.isArray(res.data) ? res.data : []
        setRows(data.map(d => ({ ...d, ...d.profile })))
        return
      }

     /* if (res?.status === 401 || res?.status === 403) {
        toast.error('Unauthorized: your session may have expired. Please login again.')
        return
      }
*/
      toast.error(res?.message ?? "Something went wrong.")
      console.warn('Failed to load users:', res)
    })
  }
  useEffect(refreshData, [user])

  const onCreate = (e)=> {
    e.preventDefault()
    if(!loading){
      const body = { //create in jquery
        name: $("#name").val(),
        password: $("#password").val(),
        password_confirmation: $("#password_confirmation").val(),
        first_name: $("#first_name").val(),
        middle_name: $("#middle_name").val(),
        last_name: $("#last_name").val(),
        email: $("#email").val(),
        address: $("#address").val(),
        phone_number: $("#phone_number").val(),
    }
      store(body, cookies.AUTH_TOKEN).then(res => {
        if(res?.ok){
          console.log(res)
          toast.success(res?.message ?? "Account has been Created")
          setCreateDialog(false)
          setWarnings({})
          refreshData()
      }
      else{
          toast.error(res?.message ?? "Something went wrong")
          setWarnings(res?.error)
      }
      }).finally(() => {
        setLoading(false)
      })
    }
    
  }

  const onDelete = () => {
    if(!loading){
      setLoading(true)
      destroy(deleteDialog, cookies.AUTH_TOKEN).then(res => {
        if(res?.ok){
          toast.success(res?.message ?? "User has been deleted")
          refreshData()
          setDeleteDialog(null)
        }
        else{
          toast.error(res?.message ?? "Something went wrong.")
        }
      }).finally(() => {
        setLoading (false)
      })
    }
  }

  const onEdit = e => {
    e.preventDefault() //avoid loading
    if(!loading){
      setLoading(true)
      update({
        first_name: editDialog.first_name,
        middle_name: editDialog.middle_name,
        last_name: editDialog.last_name,
        address: editDialog.address,
        phone_number: editDialog.phone_number,
    }, editDialog.id, cookies.AUTH_TOKEN).then(res => {
      if(res?.ok){
        toast.success(res?.message ?? "User has been Updated.")
        refreshData()
        setEditDialog(null)
    }
    else{
        toast.error("Something went wrong.")
    }
      }).finally(() => {
        setLoading(false)
      })

    }
  }


    return (
      <Box>
          {
            user ? (
              <Box sx={{mt:2}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', px: 2}}>
                  <Typography variant="h5" sx={{mb:4, color:"tomato"}}>
                    Titan User's List.
                  </Typography>
                  <Box>
                    <Button variant="contained" color="success" sx={{}} onClick={() => setCreateDialog(true)}>Create</Button>
                  </Box>
                </Box>
                  <DataGrid sx={{ mt: 1, color: 'black', height: 'calc(100vh - 150px)' }} columns={columns} rows={rows}/>
                  <Dialog open={createDialog}>
                      <DialogTitle sx={{color: "tomato"}}>
                        Create User
                      </DialogTitle>
                      <DialogContent>         
                            <Box component="form" onSubmit={onCreate} sx={{width:300, mx:'auto'}}>
                                <Box sx={{mt:1}}>
                                    <TextField required id="name" fullWidth size="small" label="User name" />
                                    {
                                        warnings?.name ? (
                                            <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.name}</Typography>
                                        ) : null
                                    }
                                </Box>
                                <Box sx={{mt:1}}>
                                    <TextField required id="email" fullWidth size="small" label="Email" />
                                    {
                                        warnings?.email ? (
                                            <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.email}</Typography>
                                        ) : null
                                    }
                                </Box>
                                <Box sx={{mt:1}}>
                                    <TextField required id="password" fullWidth size="small" label="Password" type='Password' />
                                    {
                                        warnings?.password ? (
                                            <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.password}</Typography>
                                        ) : null
                                    }
                                </Box>
                                <Box sx={{mt:1}}>
                                    <TextField required id="password_confirmation" fullWidth size="small" label="Repeat password" type='Password' />
                                </Box>
                                <Box sx={{mt:1}}>
                                    <TextField required id="first_name" fullWidth size="small" label="First name"/>
                                    {
                                        warnings?.first_name ? (
                                            <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.first_name}</Typography>
                                        ) : null
                                    }
                                </Box>
                                <Box sx={{mt:1}}>
                                    <TextField id="middle_name" fullWidth size="small" label="Middle Name"/>
                                </Box>
                                <Box sx={{mt:1}}>
                                    <TextField required id="last_name" fullWidth size="small" label="Last Name"/>
                                    {
                                        warnings?.last_name ? (
                                            <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.last_name}</Typography>
                                        ) : null
                                    }
                                </Box>
                                <Box sx={{mt:1}}>
                                    <TextField required id="address" fullWidth size="small" type="text" label="Address"/>
                                    {
                                        warnings?.address ? (
                                            <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.address}</Typography>
                                        ) : null
                                    }
                                </Box>
                                <Box sx={{mt:1}}>
                                    <TextField required id="phone_number" fullWidth size="small" type="text" label="Phone Number"/>
                                    {
                                        warnings?.phone_number ? (
                                            <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.phone_number}</Typography>
                                        ) : null
                                    }
                                </Box>
                                <Box sx={{mt:2, textAlign:"center"}}>
                                  <Button id="submit_btn" disabled={loading} type="submit" sx={{display: 'none'}}></Button>
                                </Box>
                                </Box>
                      </DialogContent>
                      <DialogActions>
                      <Button onClick={() => setCreateDialog(false)} color='info'>Close</Button>
                      <Button onClick={() => {$("#submit_btn").trigger("click")}}>Create</Button>
                      </DialogActions>
                  </Dialog>
                  <Dialog open={!!deleteDialog}>
                    <DialogTitle>
                      Are you sure?
                    </DialogTitle>
                    <DialogContent>
                      <Typography>
                        Do you want to delete this user with ID:{deleteDialog}?
                      </Typography>
                    </DialogContent>
                    <DialogActions sx={{display: !!deleteDialog ? "flex" : "none"}}>
                      <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                      <Button disabled={loading} onClick={onDelete}>Confirm</Button>
                    </DialogActions>
                  </Dialog>
                  <Dialog open={!!editDialog}>
                    <DialogTitle sx={{color:"tomato"}}>
                       Edit User
                    </DialogTitle>
                    <DialogContent>
                      <Box component="form" onSubmit={onEdit} sx={{p:1}}>
                          <Box sx={{mt:0}}>
                            <TextField onChange={e => setEditDialog({...editDialog, first_name: e.target.value})} value={editDialog?.first_name ?? ""} size="small" fullWidth label="First name" />
                          </Box>
                          <Box sx={{mt:1}}>
                            <TextField  onChange={e => setEditDialog({...editDialog, middle_name: e.target.value})} value={editDialog?.middle_name ?? ""} size="small" fullWidth label="Middle name" />
                          </Box>
                          <Box sx={{mt:1}}>
                            <TextField  onChange={e => setEditDialog({...editDialog, last_name: e.target.value})} value={editDialog?.last_name ?? ""} size="small" fullWidth label="Last name" />
                          </Box>
                          <Box sx={{mt:1}}>
                            <TextField  onChange={e => setEditDialog({...editDialog, address: e.target.value})} value={editDialog?.address ?? ""} size="small" fullWidth label="Address" />
                          </Box>
                          <Box sx={{mt:1}}>
                            <TextField  onChange={e => setEditDialog({...editDialog, phone_number: e.target.value})} value={editDialog?.phone_number ?? ""} size="small" fullWidth type="text" />
                          </Box>
                          <Button id="edit-btn" type="submit" sx={{display: "none"}} />
                      </Box>
                    </DialogContent>
                    <DialogActions sx={{display: !!editDialog ? "flex" : "none"}}>
                      <Button onClick={() => setEditDialog(null)}>Close</Button>
                      <Button disabled={loading} onClick={(onEdit)}>Update</Button>
                    </DialogActions>
                  </Dialog>
              </Box>
            ) : null
          }
      </Box>
    )
}

export default checkAuth(Users)