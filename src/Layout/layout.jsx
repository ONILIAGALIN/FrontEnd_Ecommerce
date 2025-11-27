import { AppBar, Box, Button, Divider, Toolbar, Typography,Paper, InputBase, IconButton } from '@mui/material'
import { People as PeopleIcon, Home as HomeIcon,Payment as PaymentIcon, Login as LoginIcon,Logout as LogoutIcon, Storefront as StorefrontIcon} 
from '@mui/icons-material'
import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import checkAuth from '../hoc/checkAuth'
import { useSelector, useDispatch } from 'react-redux'
import { useCookies } from 'react-cookie';
import { logout } from '../redux/authSlice'
import {toast} from 'react-toastify'

 function Layout() {
  const user = useSelector(state => state.auth.user)
  const isAdmin = String(user?.role ?? user?.role_id ?? '').toLowerCase() === 'admin'
  const [cookies, setCookie, removeCookie] = useCookies()
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const onLogout = () => {
    removeCookie("AUTH_TOKEN")
    dispatch(logout())
    toast.success("Logged out successfully!")
    navigate('/')
  }

  
  const pages  = [
    {
      label: 'Users',
      link: '/users',
      icon: <PeopleIcon />,
      isAdmin: true,
    },
    {
      label: 'Products',
      link: '/products',
      icon: <HomeIcon />,
      isAdmin: true,
    },
    {
      label: 'Carts',
      link: '/carts',
      icon: <PaymentIcon />
    },
    {
    label: 'Orders',
    link: '/orders',
    icon: <StorefrontIcon />
    }

  ]

  const handleDrawerToggle = () => {}
    return (

        <Box >
        <AppBar position="static" sx={{pt:1,pb:1, backgroundColor:"tomato"}} >
          <Toolbar>
            <Box sx={{flex: 1, display: 'flex', justifyContent: 'start', alignItems: 'center', gap: 2}}>
              <Link to="/">
                <Typography variant="h6" component="div" sx={{ color:'whitesmoke' }}>
                  Titan Tools
                </Typography>
              </Link>
              <Box sx={{display:'flex', gap: 2, alignItems:'center', ml: 3}}>
                  {pages.map(page => (
                    (isAdmin || !page?.isAdmin) ? (
                    <Button key={page.label} component={Link} to={page.link} startIcon={page?.icon ?? null} color="inherit">
                      {page.label}
                    </Button>
                  ) : null
                ))}
              </Box>
            </Box>
            <Box>
              {
                user ? (
                  <Button variant="contained" sx={{ backgroundColor: 'white', color: 'tomato' }} onClick={onLogout} startIcon={<LogoutIcon/>}>Logout</Button>
                ) : (
                  <Link to="/login">
                    <Button variant="contained" sx={{ backgroundColor: 'white', color: 'tomato' }} startIcon={<LoginIcon/>}>Login</Button>
                  </Link>
                )
              }
              
            </Box>
          </Toolbar>
        </AppBar>
        <Divider />
          <Outlet />
        </Box>
    )
}


export default checkAuth(Layout)