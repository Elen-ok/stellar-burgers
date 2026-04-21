
import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';

export const Profile: FC = () => {
  const savedUser = JSON.parse(localStorage.getItem('demo-user') || '{"name":"","email":""}');
  
  const [formValue, setFormValue] = useState({
    name: savedUser.name || '',
    email: savedUser.email || '',
    password: ''
  });

  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('demo-user') || '{"name":"","email":""}');
    setFormValue({
      name: user.name || '',
      email: user.email || '',
      password: ''
    });
  }, []);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    localStorage.setItem('demo-user', JSON.stringify({ name: formValue.name, email: formValue.email }));
    setIsFormChanged(false);
    alert('Данные сохранены!');
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('demo-user') || '{"name":"","email":""}');
    setFormValue({
      name: user.name || '',
      email: user.email || '',
      password: ''
    });
    setIsFormChanged(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
    setIsFormChanged(true);
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};

export default Profile;
