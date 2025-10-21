// App.js hoặc file router của bạn
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { router } from './router/router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <CartProvider>
            <RouterProvider router={router} />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </CartProvider>
    );
}

export default App;