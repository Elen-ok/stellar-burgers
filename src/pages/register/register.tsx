import { FC, SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterUI } from '@ui-pages';

export const Register: FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (userName && email && password) {
      localStorage.setItem('demo-auth', 'true');
      localStorage.setItem('demo-user', JSON.stringify({ email, name: userName }));
      navigate('/');
    } else {
      setError('Заполните все поля');
    }
  };

  return (
    <RegisterUI
      errorText={error}
      email={email}
      setEmail={setEmail}
      userName={userName}
      setUserName={setUserName}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};

export default Register;
