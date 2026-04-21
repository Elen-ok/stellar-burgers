import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProfileMenuUI } from '@ui';

export const ProfileMenu: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const handleLogout = () => {
    localStorage.removeItem('demo-auth');
    localStorage.removeItem('demo-user');
    navigate('/login');
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
