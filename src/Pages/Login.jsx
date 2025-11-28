import { Box, Button, TextField, Typography } from '@mui/material'
import LoginIcon from '@mui/icons-material/Login'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginAPI} from '../api/auth'
import { useCookies } from 'react-cookie'
import { useDispatch } from 'react-redux'
import { login } from '../redux/authSlice'
import { toast } from 'react-toastify'
import { InputAdornment } from '@mui/material'
import { AccountCircle, Lock } from '@mui/icons-material'
import $ from 'jquery'
export default function Login() {
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [cookies, setCookie,removeCookie] = useCookies();
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const onSubmit = (e) => {
        e.preventDefault()
        loginAPI({
            name,
            password
        }).then(res => {
            console.log(res)
            if(res?.ok){
                setCookie("AUTH_TOKEN", res.data?.token)
                const userPayload = res.data?.user ?? res.data
                dispatch(login(userPayload))
                navigate("/")
                toast.success(res?.message ?? "Login successfully.")
            }
            else{
                toast.error(res?.message ?? "Something went wrong.")
                setWarnings(res?.errors)
            }
        })
    }

    return (
        <Box
            className="Login" sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage:  'url("https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <Box sx={{minHeight:250, width: 400, boxShadow: 'black 0px 0px  2px', borderRadius:2, backgroundColor:'rgba(255,255,255,.8)'}}>
            <Typography variant="h6" sx={{textAlign:'center', mt:2, color:'tomato'}}>
                Sign In you Account
            </Typography>
            <Box component="form" onSubmit={onSubmit} sx={{width:300, mx:'auto'}}>
                <Box sx={{mt:1}}>
                    <TextField onChange={(e) => setName(e.target.value)} value={name} fullWidth size="small" label="Username" className='username' required InputProps={{ startAdornment: ( <InputAdornment position="start"> <AccountCircle sx={{ fontSize: 20, color: 'tomato' }} /> </InputAdornment>),}}/>
                </Box>
                <Box sx={{mt:1}}>
                    <TextField onChange={(e) => setPassword(e.target.value)} value={password} fullWidth size="small" label="Password" className='username' type='password' required InputProps={{ startAdornment: ( <InputAdornment position="start"> <Lock sx={{ fontSize: 20, color: 'tomato' }} /> </InputAdornment>),}}/>
                </Box>
                <Box>
                </Box>
                <Box sx={{mt:2, textAlign:"center",}}>
                    <Button type="submit" variant="contained" sx={{backgroundColor: 'tomato', color: 'white'}} startIcon={<LoginIcon />}>Login</Button>
                </Box>
            </Box>
            <Box sx={{textAlign:'center', mt:2}}>
                <Link to="/register">
                    <Typography sx={{color: 'tomato'}} className="box"> 
                        Don't have an account yet?
                    </Typography>
                </Link>
            </Box>
        </Box>
    </Box>
  )
}
