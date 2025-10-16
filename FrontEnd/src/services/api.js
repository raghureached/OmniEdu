import axios from 'axios';

const production=false;
const api = axios.create({
    baseURL: production ? "https://omniedu-server.onrender.com": 'http://localhost:5003',
    // baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials:true
});

// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && error.response.status === 401) {
//             try {
//                 localStorage.removeItem('authState');
//                 localStorage.removeItem('token');
//             } catch(_) {}
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

export default api;