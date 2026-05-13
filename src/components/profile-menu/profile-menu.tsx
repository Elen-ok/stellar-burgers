import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from '../../services/store';
import { logout } from '../../services/slices/userSlice';
import { ProfileMenuUI } from '@ui';

export const ProfileMenu: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate('/login', { replace: true });
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
