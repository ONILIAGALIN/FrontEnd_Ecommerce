import { Box, Button, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import $ from 'jquery'
import { register } from '../api/auth'
import { toast } from 'react-toastify'
import { useCookies } from 'react-cookie'
import { useDispatch } from 'react-redux'
import { login } from '../redux/authSlice'


export default function Register() {
    const [warnings, setWarnings] = useState({})
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [cookies, setCookie, removeCookie] = useCookies()
    const dispatch = useDispatch()

    const onSubmit = (e) => {
        e.preventDefault()
        if(!loading){
       const body = { 
            name: $("#name").val(),
            email: $("#email").val(),
            password: $("#password").val(),
            password_confirmation: $("#password_confirmation").val(),
            first_name: $("#first_name").val(),
            middle_name: $("#middle_name").val(),
            last_name: $("#last_name").val(),
            address: $("#address").val(),
            phone_number: $("#phone_number").val(),
        }
        if(!body.middle_name){
            delete body.middle_name
        }
        setLoading(true)
        register(body).then(res => {
            console.log(res)
            if(res?.ok){
                toast.success(res?.message ?? "Account has been Registered")
                setCookie("AUTH_TOKEN", res.data?.token)
                const userPayload = res.data?.user ?? res.data
                dispatch(login(userPayload))
                navigate("/login")
            }
            else{
                toast.error(res?.message ?? "Something went wrong")
                setWarnings(res?.errors)
            }
        }).finally(() => {
            setLoading(false)
        })
    }
}

    return (

        <Box
            className="Login" sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage:  'url("https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <Box
                sx={{width: { xs: "100%", sm: 380, md: 420 }, minHeight: 250, boxShadow: "0px 0px 5px rgba(0,0,0,.4)", borderRadius: 2, backgroundColor: "rgba(255,255,255,0.85)",p: { xs: 3, sm: 4 },}}>
                <Typography
                  variant="h6"
                  sx={{ textAlign: "center", color: "tomato", mb: 2 }}>
                  Titan tool Register
                </Typography>
                <Box component="form" onSubmit={onSubmit} sx={{width:"100%",maxWidth:300, mx:'auto'}}>
                    <Box sx={{mt:1}}>
                        <TextField required id="name" fullWidth size="small" label="Username"/>
                        {
                            warnings?.name ? (
                                <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.name}</Typography>
                            ) : null
                        }
                    </Box>
                    <Box sx={{mt:1}}>
                        <TextField required id="email" fullWidth size="small" label="Email" type='email' />
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
                        <TextField id="middle name" fullWidth size="small" label="Middle name"/>
                    </Box>
                    <Box sx={{mt:1}}>
                        <TextField required id="last_name" fullWidth size="small" label="Last name"/>
                        {
                            warnings?.last_name ? (
                                <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.last_name}</Typography>
                            ) : null
                        }
                    </Box>
                    <Box sx={{mt:1}}>
                        <TextField required id="address" fullWidth size="small" label="Address" type='text' />
                        {
                            warnings?.address ? (
                                <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.address}</Typography>
                            ) : null
                        }
                    </Box>
                    <Box sx={{mt:1}}>
                        <TextField required id="phone_number" fullWidth size="small" type="number" label="Phone Number"/>
                        {
                            warnings?.phone_number ? (
                                <Typography sx={{fontSize: 12}} component="small" color="error">{warnings.phone_number}</Typography>
                            ) : null
                        }
                    </Box>
                    
                    <Box sx={{mt:2, textAlign:"center"}}>
                        <Button disabled={loading} type="submit" variant="contained" sx={{backgroundColor: 'tomato', color: 'white'}}>Register</Button>
                    </Box>
                    </Box>
                    <Box sx={{textAlign:'center', my:2}}>
                    <Link to="/login">
                        <Typography sx={{color: 'tomato'}} className="box"> 
                        Already have an Account
                        </Typography>
                    </Link>
                </Box>
            </Box>
        </Box>
    )
}