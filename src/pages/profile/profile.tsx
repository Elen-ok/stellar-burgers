import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchUser, updateUserData } from '../../services/slices/userSlice';

export const Profile: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [formValue, setFormValue] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      setFormValue({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
    }
  }, [user]);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    dispatch(updateUserData({
      name: formValue.name,
      email: formValue.email,
      password: formValue.password || undefined
    }))
      .unwrap()
      .then(() => {
        setIsFormChanged(false);
      })
      .catch((err: Error) => {
        alert(err.message || 'Ошибка обновления данных');
      });
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    if (user) {
      setFormValue({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
    }
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
