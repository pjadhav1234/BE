// Role checks, logout helpers.

// export const isAuthenticated = () => {
//   return !!localStorage.getItem('token');
// };

// export const getUserRole = () => {
//   const token = localStorage.getItem('token');
//   if (!token) return null;
//   const payload = JSON.parse(atob(token.split('.')[1]));
//   return payload.role;
// };