import { Box, Button, Typography, IconButton, Tooltip, Rating, Paper,InputBase } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { index as productsIndex } from '../api/product'
import { store as cartStore } from '../api/cart'
import { image } from '../api/configuration'
import { toPeso, typeToString } from '../api/offline'
import { Link, useNavigate } from 'react-router-dom'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SearchIcon from '@mui/icons-material/Search';
import {useCookies} from 'react-cookie'
import {toast} from 'react-toastify'
import checkAuth from '../hoc/checkAuth'
import { useSelector } from 'react-redux'

function Card({product, onAdd}){
  const user = useSelector(state => state.auth.user)
  
  const imgUrl = product.image_url ?? product.image ?? (product.extension ? `${image}/${product.id}.${product.extension}` : null)
  console.debug('Card image url', { productId: product.id, extension: product.extension, imgUrl })
  return (
    <Box sx={{width: '300px', textAlign: 'center', boxShadow: '10px 5px 20px rgba(0, 0, 0.1, 0.1)', mt:5, display: 'flex', flexDirection: 'column', minHeight: 380}}>
      <Box sx={{position: 'relative', width: '240px', height: '120px', mt: 2, mx: 'auto'}}>
        <Box sx={{position:'absolute', inset:0, background: imgUrl ? `url('${imgUrl}')` : "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvFGq7TEwR0Rd5WGLrO0bJ9BpYEJPeYIZtxmkWGL4b4A&s')", backgroundSize: 'cover', backgroundPosition: 'center'}} />

      </Box>
      <Box sx={{p: 2, textAlign: 'left', display: 'flex', flexDirection: 'column', flex: 1}}>
        <Typography sx={{fontFamily:'serif'}}>
          Name: {product.name}
        </Typography>
        <Typography sx={{fontFamily:'serif'}}>
          Description: {product.description}
        </Typography>
        <Typography sx={{fontFamily:'serif'}}>
           Stock: {product.stock ?? 'unknown'}
        </Typography>
         <Typography sx={{fontFamily:'serif'}}>
          Price: {toPeso(product.price)}
        </Typography>
        <Typography variant="body2"></Typography>
  <Rating name={`product-rating-${product.id}`} value={product.rating ?? 0} precision={1} readOnly size="small"/>
        <Box align="center" sx={{mt: 'auto', fontFamily:'serif'}} >
          <Tooltip title={ !!user ? 'Add to cart' : 'You must login to add items' }>
            <Button
            variant="contained"
             sx={{width:250, color:'white', background: 'tomato'}} startIcon={<ShoppingCartIcon />} onClick={!!user ? onAdd : () => toast.error('You need to login first')}
            disabled={(product.stock ?? 1) <= 0 || (product.status != null && product.status !== 1)}>Add to Cart</Button>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}

function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cookies, setCookie, removeCookie] = useCookies()
  const user = useSelector(state => state.auth.user)
  const navigate = useNavigate()

  useEffect(() => {
    productsIndex()
      .then(res => {
        if (Array.isArray(res)) {
          setProducts(res)
        } else if (res?.ok) {
          setProducts(res.data || [])
        } else if (res?.data && Array.isArray(res.data)) {
          setProducts(res.data)
        } else {
          console.error('Unexpected products response:', res)
          setProducts([])
        }
      })
      .catch(err => {
        console.error('Failed to load products:', err)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [])
  

  useEffect(() => {
  if(!searchQuery.trim()) {
    setFilteredProducts(products);
  } else {
    const q = searchQuery.toLowerCase();
    setFilteredProducts(products.filter(p => p.name.toLowerCase().includes(q)));
  }
}, [products, searchQuery]);



  const addToCart = (product) => {
    if(!user && !cookies?.AUTH_TOKEN){
      toast.error('You need to login first')
      return
    }

    const body = { product_id: product.id, quantity: 1 }

    console.debug('Home.addToCart: sending', { url: `${image ? image : 'unknown'}`, tokenMask: cookies?.AUTH_TOKEN ? `${String(cookies.AUTH_TOKEN).slice(0,8)}...` : null, body });
    cartStore(body, cookies.AUTH_TOKEN).then(res => {
      console.debug('addToCart response', res)
      if (res?.ok) {
        toast.success(res?.message ?? 'Added to cart')
        navigate('/carts')
        return
      }

      const potentialErrors = res?.errors ?? res?.error ?? res?.messages ?? null
      if (potentialErrors) {
        const msgs = []
        if (Array.isArray(potentialErrors)) {
          msgs.push(...potentialErrors.map(m => String(m)))
        } else if (typeof potentialErrors === 'object') {
          for (const k of Object.keys(potentialErrors)) {
            const v = potentialErrors[k]
            if (Array.isArray(v)) msgs.push(...v.map(m => String(m)))
            else msgs.push(String(v))
          }
        } else {
          msgs.push(String(potentialErrors))
        }

        const message = msgs.length ? msgs.join(' | ') : (res?.message ?? 'Validation failed')
        console.warn('Validation failed:', message, res)
        toast.error(message)
        return
      }

      console.warn('Add to cart unsuccessful:', res)
      const statusPart = res?.status ? `(${res?.status}) ` : ''
      const msg = res?.message ?? 'Could not add to cart'
      toast.error(`${statusPart}${msg}`)
    }).catch((err) => {
      console.error('Add to cart failed:', err)
      const msg = err?.message ?? 'Network error'
      if (msg === 'Failed to fetch' || msg === 'Network Error' || msg === 'Network error (failed to fetch)') {
        toast.error('Network error: failed to fetch. Check that the backend is running, the API URL in src/api/configuration.js is correct, and CORS is enabled on the server.')
      } else {
        toast.error(msg)
      }
    })
  }

  return (
    <Box sx={{ mt: 5 }}>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: -12, mb: 7 }}>
        <Paper component="form" sx={{ display: 'flex', alignItems: 'center', width: 450, height: 35, p: '2px 4px', ml:22 }} onSubmit={e => e.preventDefault()}>
          <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
          <IconButton type="submit">
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>
      <Box>
        <Typography align="center" sx={{ fontFamily: 'serif', fontWeight: 'bold' }} variant="h5">
        Welcome to Titan Tools – Strength you can depend on. We're glad to have you here.
      </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
        {filteredProducts.map(product => (
          <Card product={product} key={product.id} onAdd={() => addToCart(product)} />
        ))}
    </Box>
</Box>

  )
}

export default checkAuth(Home)