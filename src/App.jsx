import { useState } from 'react'
import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import store from './redux/store'
import { Provider } from 'react-redux'
import Layout from './Layout/layout.jsx'
import User from './Pages/User'
import Product from './Pages/Product'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Home from './Pages/Home'
import Cart from './Pages/Cart'
import Orders from './Pages/Orders.jsx'

function App() {

  const router = createBrowserRouter([

    {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'users', element: <User /> },
      { path: 'products', element: <Product /> },
      { path: 'carts', element: <Cart /> },
      { path: 'orders', element: <Orders /> },
      ]
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />
    },

  ])

  return (
    <Provider store={store}>
    <RouterProvider router={router} />
    </Provider>
  )
}
export default App
