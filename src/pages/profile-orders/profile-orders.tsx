import { useEffect, FC } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { ProfileOrdersUI } from '@ui-pages';
import { Preloader } from '@ui';
import { fetchFeed } from '../../services/slices/feedSlice';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.feed);

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  if (loading && !orders.length) {
    return <Preloader />;
  }

  // Показываем последние 10 заказов как историю пользователя
  const userOrders = orders.slice(0, 10);

  return <ProfileOrdersUI orders={userOrders} />;
};

export default ProfileOrders;
