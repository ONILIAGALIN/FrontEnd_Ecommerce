import { AppBar, Box, Button, Divider, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { People as PeopleIcon, Home as HomeIcon, Payment as PaymentIcon, Login as LoginIcon, Logout as LogoutIcon, Storefront as StorefrontIcon, Menu as MenuIcon } from '@mui/icons-material'
import React, { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import checkAuth from '../hoc/checkAuth'
import { useSelector, useDispatch } from 'react-redux'
import { useCookies } from 'react-cookie'
import { logout } from '../redux/authSlice'
import { toast } from 'react-toastify'

function Layout() {
  const user = useSelector(state => state.auth.user)
  const isAdmin = String(user?.role ?? user?.role_id ?? '').toLowerCase() === 'admin'
  const [cookies, , removeCookie] = useCookies()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const onLogout = () => {
    removeCookie("AUTH_TOKEN")
    dispatch(logout())
    toast.success("Logged out successfully!")
    navigate('/')
  }

  const pages = [
    { label: 'Users', link: '/users', icon: <PeopleIcon />, isAdmin: true },
    { label: 'Products', link: '/products', icon: <HomeIcon />, isAdmin: true },
    { label: 'Carts', link: '/carts', icon: <PaymentIcon /> },
    { label: 'Orders', link: '/orders', icon: <StorefrontIcon /> }
  ]

  const toggleDrawer = () => setDrawerOpen(prev => !prev)

  return (
    <Box>
      <AppBar position="static" sx={{ pt: 1, pb: 1, backgroundColor: "tomato" }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {/* Left: logo + nav */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" component={Link} to="/" sx={{ color: 'whitesmoke', textDecoration: 'none' }}>
              Titan Tools
            </Typography>

            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              {pages.map(page => ((isAdmin || !page?.isAdmin) &&
                <Button key={page.label} component={Link} to={page.link} startIcon={page.icon} color="inherit">
                  {page.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Right: login/logout */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            {user ? (
              <Button variant="contained" sx={{ backgroundColor: 'white', color: 'tomato' }} onClick={onLogout} startIcon={<LogoutIcon />} >Logout</Button>
                ) : (
              <Button variant="contained" component={Link} to="/login" sx={{ backgroundColor: 'white', color: 'tomato' }} startIcon={<LoginIcon />}>Login</Button>
            )}
          </Box>

          {/* Mobile menu button */}
          <IconButton color="inherit" edge="end" sx={{ display: { sm: 'none' } }} onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer} onKeyDown={toggleDrawer}>
          <List>
            {pages.map(page => ((isAdmin || !page?.isAdmin) &&
              <ListItem button key={page.label} component={Link} to={page.link}>
                <ListItemIcon>{page.icon}</ListItemIcon>
                <ListItemText primary={page.label} />
              </ListItem>
            ))}
            <Divider />
            {user ? (
              <ListItem button onClick={onLogout}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            ) : (
              <ListItem button component={Link} to="/login">
                <ListItemIcon><LoginIcon /></ListItemIcon>
                <ListItemText primary="Login" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      <Divider />
      <Outlet />
    </Box>
  )
}

export default checkAuth(Layout)
