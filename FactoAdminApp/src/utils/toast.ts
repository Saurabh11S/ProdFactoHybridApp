import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showError = (err: string) => {
  toast.error(err, {
    position: 'top-right',
    onClose: () => console.log("Toast closed"),
  });
};
export const showSucccess = (err: string) => {
  toast.success(err, {
    position: 'top-right',
    onClose: () => console.log("Toast closed"),
  });
};
