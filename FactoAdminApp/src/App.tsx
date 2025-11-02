import { ToastContainer } from 'react-toastify';
import './App.css';
import Router from './router/Router';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('Route changed to:', location.pathname); // Debugging log
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const App = () => {
  const location = useLocation();

  return (
    <div key={location.pathname}>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ScrollToTop />
      <Router />
    </div>
  );
};

export default App;
