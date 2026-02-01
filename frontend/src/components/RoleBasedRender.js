import { useAuth } from '../context/AuthContext';

export const RoleBasedRender = ({ feature, mode = 'read', children }) => {
  const { canRead, canWrite } = useAuth();
  
  if (mode === 'write') {
    return canWrite(feature) ? children : null;
  }
  
  return canRead(feature) ? children : null;
};

export default RoleBasedRender;
