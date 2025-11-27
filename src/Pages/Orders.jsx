import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Divider } from '@mui/material';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { getOrders, updateOrderStatus } from '../api/order';
import { image as IMAGE_URL } from '../api/configuration';

export default function AdminOrder() {
  const [orders, setOrders] = useState([]);
  const [cookies] = useCookies();
  const role = cookies.USER_ROLE; // 'admin' or 'user'
  
  const loadOrders = async () => {
    const token = cookies.AUTH_TOKEN;
    const userId = cookies.USER_ID; // needed para sa user-specific orders
    if (!token) return toast.error('No authentication token found');
    
    try {
      const res = await getOrders(token);
      if (res.ok) setOrders(res.data || []);
      else toast.error(res.message ?? 'Failed to fetch orders');
    } catch (err) {
      toast.error(err.message ?? 'Network error');
    }
  };

  const handleStatusChange = async (orderId, status) => {
    const token = cookies.AUTH_TOKEN;
    if (!token) return toast.error('No authentication token found');

    try {
      const res = await updateOrderStatus(orderId, status, token);
      if (res.ok) {
        toast.success(res.message ?? 'Status updated');
        loadOrders();
      } else {
        toast.error(res.message ?? 'Failed to update status');
      }
    } catch (err) {
      toast.error(err.message ?? 'Network error');
    }
  };

  useEffect(() => {
    loadOrders();
  }, [cookies.AUTH_TOKEN]);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', gap: 2, ml: 2, mt: 2}}>
      {orders.map(order => (
        <Card key={order.id} sx={{ width: 300, p: 2 }}>
          <Typography variant="h6">Order Summary</Typography>
           <Typography>Order By: {order.user?.name}</Typography>
          <Typography>Status: {order.status}</Typography>
          <Typography>Total: ₱{order.total_amount.toLocaleString()}</Typography>
          <Divider sx={{ my: 1 }} />
          
          {order.items.map(item => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 50, height: 50, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url('${item.product.image_url ?? `${IMAGE_URL}/${item.product.id}.${item.product.extension}`}')`}}/><Box>
                <Typography>{item.product.name}</Typography>
                <Typography>₱{item.price.toLocaleString()} x {item.quantity}</Typography>
              </Box>
            </Box>
          ))}
          {orders.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {['pending', 'paid', 'shipped'].map(statusOption => (
                <Button key={statusOption} variant={order.status === statusOption ? 'contained' : 'outlined'} onClick={() => handleStatusChange(order.id, statusOption)}>{statusOption}</Button>
              ))}
            </Box>
          )}
        </Card>
      ))}
    </Box>
  );
}
