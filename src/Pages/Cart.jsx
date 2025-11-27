import React, { useState, useEffect } from "react";
import {Box,Card,CardContent, Typography,IconButton, Button,Checkbox, FormControlLabel,Divider,} from "@mui/material";
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useCookies } from 'react-cookie'
import { index as cartIndex, update as cartUpdate, destroy as cartDestroy } from '../api/cart'
import { checkout as orderCheckout } from '../api/order'
import { image as IMAGE_URL } from '../api/configuration';
export default function Cart() {
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState([])
  const [cookies] = useCookies()
  const token = cookies.AUTH_TOKEN
  const navigate = useNavigate()

  const loadCart = async () => {
    try {
      console.debug('Cart.loadCart: tokenMask', token ? `${String(token).slice(0,8)}...` : null)
      const res = await cartIndex(token)

      if (Array.isArray(res)) {
        setCart(res)
      } else if (res?.ok) {
        setCart(res.data || [])
      } else if (Array.isArray(res?.data)) {
        setCart(res.data)
      } else {
    
        if (res?.data && typeof res.data === 'object' && Array.isArray(res.data.items)) {
          setCart(res.data.items)
        } else {
          console.debug('Cart.loadCart: unexpected response shape', res)
          setCart([])
        }
      }
    } catch (err) {
      console.error('Cart.loadCart failed:', err)
      setCart([])
    }
  };

  useEffect(() => {
    loadCart();
  }, [cookies?.AUTH_TOKEN]);

  const increaseQty = async (item) => {
    const newQty = item.quantity + 1;

    try {
      console.debug('Cart.increaseQty: sending', { id: item.id, newQty, tokenMask: token ? `${String(token).slice(0,8)}...` : null })
      const res = await cartUpdate({ quantity: newQty }, item.id, token)
      if (!res?.ok) return toast.error(res?.message ?? 'Could not update cart')
      loadCart()
    } catch (err) {
      console.log(err);
    }
  };

  const decreaseQty = async (item) => {
    if (item.quantity <= 1) return;

    const newQty = item.quantity - 1;

    console.debug('Cart.decreaseQty: sending', { id: item.id, newQty, tokenMask: token ? `${String(token).slice(0,8)}...` : null })
    const res = await cartUpdate({ quantity: newQty }, item.id, token)
    if (!res?.ok) return toast.error(res?.message ?? 'Could not update cart')
    loadCart()
  };

  const removeItem = async (id) => {
    console.debug('Cart.removeItem: sending', { id, tokenMask: token ? `${String(token).slice(0,8)}...` : null })
    const res = await cartDestroy(id, token)
    if (res?.ok) toast.success('Removed from cart!')
    else toast.error(res?.message ?? 'Could not remove item')
    loadCart()
    setSelected(prev => prev.filter(x => x !== id))
  };

  useEffect(() => {
    setSelected(prev => prev.filter(id => cart.some(i => i.id === id)))
  }, [cart])

  const toggleSelected = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectAll = () => {
    if(cart.length === 0) return
    if(selected.length === cart.length) setSelected([])
    else setSelected(cart.map(i => i.id))
  }

  const selectedTotal = cart.filter(i => selected.includes(i.id)).reduce((sum, item) => {
    const total = typeof item.total_price === 'number' ? item.total_price : (item.product?.price ?? 0) * (item.quantity ?? 0)
    return sum + total
  }, 0)

  const onCheckout = async () => {
    if(!token) return toast.error('You must be logged in to checkout')
    if(selected.length === 0) return toast.error('Please select at least one item to checkout')

    const items = cart.filter(i => selected.includes(i.id)).map(i => ({ cart_id: i.id, product_id: i.product?.id, quantity: i.quantity }))
    try {
      console.debug('Cart.checkout: sending', { tokenMask: token ? `${String(token).slice(0,8)}...` : null, items })
      const res = await orderCheckout(token, { items })
      if(res?.ok) {
        toast.success(res?.message ?? 'Checkout successful')
        setSelected([])
        loadCart()
        navigate('/orders')
      } else {
        toast.error(res?.message ?? 'Checkout failed')
      }
    } catch (err) {
      console.error('Cart.checkout failed', err)
      toast.error(err?.message ?? 'Network error')
    }
  }

  const totalAmount = cart.reduce((sum, item) => {
    const total = typeof item.total_price === 'number' ? item.total_price : (item.product?.price ?? 0) * (item.quantity ?? 0)
    return sum + total
  }, 0)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Your Cart
      </Typography>

      { !token ? (
        <Box sx={{display:'flex', flexDirection:'column', gap:2}}>
          <Typography>You need to login to see your cart.</Typography>
          <Button variant="outlined" onClick={() => navigate('/login')}>Sign in</Button>
        </Box>
          ) : cart.length === 0 ? (
        <Typography sx={{color: "tomato"}}>Your cart is empty.</Typography>
          ) : (
        <Box>
          <FormControlLabel
            control={<Checkbox checked={selected.length === cart.length && cart.length > 0} onChange={selectAll} />}
            label="Select All"
          />
          {cart.length > 0 && (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
    {cart.map((item) => (
      <Card key={item.id} sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
        <CardContent
          sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between",}}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox checked={selected.includes(item.id)} onChange={() => toggleSelected(item.id)} />
            <Box>
              <Typography variant="h6">{item.product?.name}</Typography>
              <Typography variant="body2">₱{(item.product?.price ?? 0).toLocaleString()}</Typography>
              <Box
                sx={{ width: 50, height: 50, backgroundSize: 'cover', backgroundPosition: 'center',backgroundImage: `url('${item.product.image_url ?? `${IMAGE_URL}/${item.product.id}.${item.product.extension}`}')`,
                }}/>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <IconButton onClick={() => decreaseQty(item)}>
                  <Minus size={18} />
                </IconButton>
                <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                <IconButton onClick={() => increaseQty(item)}>
                  <Plus size={18} />
                </IconButton>
              </Box>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right", mt: 1 }}>
            <Typography variant="h6">
              ₱{((item.total_price ?? ((item.product?.price ?? 0) * (item.quantity ?? 0))).toLocaleString())}
            </Typography>

              <IconButton onClick={() => removeItem(item.id)} color="error">
                <Trash2 size={22} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
)}        
</Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" fontWeight="bold" color="tomato">
        Total: ₱{selectedTotal.toLocaleString()}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button variant="outlined" color="error" onClick = {() => navigate('/')}> Cancel </Button>
        <Button variant="contained" disabled={selected.length === 0 || !token} onClick={onCheckout}> Checkout {selected.length > 0 ? `(${selected.length}) ₱${selectedTotal.toLocaleString()}` : ''}</Button>

      </Box>

    </Box>
  );
}
