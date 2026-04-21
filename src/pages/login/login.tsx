import { FC, SyntheticEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginUI } from '@ui-pages';

export const Login: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (email && password) {
      // Демо-авторизация
      localStorage.setItem('demo-auth', 'true');
      localStorage.setItem('demo-user', JSON.stringify({ email, name: email.split('@')[0] }));
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } else {
      setError('Введите email и пароль');
    }
  };

  return (
    <LoginUI
      errorText={error}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};

export default Login;
