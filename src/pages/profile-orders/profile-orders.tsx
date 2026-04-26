import { useEffect, FC } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { ProfileOrdersUI } from '@ui-pages';
import { Preloader } from '@ui';
import { fetchProfileOrders } from '../../services/slices/profileOrdersSlice';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.profileOrders);

  useEffect(() => {
    console.log('ProfileOrders: загружаем заказы');
    dispatch(fetchProfileOrders());
  }, [dispatch]);

  if (loading && !orders.length) {
    return <Preloader />;
  }

  if (error) {
    console.error('ProfileOrders error:', error);
  }

  console.log('ProfileOrders: отображаем заказы', orders.length);
  return <ProfileOrdersUI orders={orders} />;
};

export default ProfileOrders;
