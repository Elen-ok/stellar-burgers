import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { BurgerConstructorUI } from '../ui/burger-constructor';
import { createOrder, clearOrder, resetLoading } from '../../services/slices/orderSlice';
import { clearConstructor } from '../../services/slices/constructorSlice';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bun, ingredients } = useSelector((state) => state.burgerConstructor);
  const { order, loading } = useSelector((state) => state.order);
  const { isAuthenticated } = useSelector((state) => state.user);

  const constructorItems = {
    bun: bun,
    ingredients: ingredients
  };

  const price = useMemo(() => {
    const bunPrice = bun ? bun.price * 2 : 0;
    const ingredientsPrice = ingredients.reduce((sum, item) => sum + item.price, 0);
    return bunPrice + ingredientsPrice;
  }, [bun, ingredients]);

  const onOrderClick = () => {
    if (loading) {
      console.log('Заказ уже оформляется, подождите...');
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!bun) {
      alert('Добавьте булку');
      return;
    }
    
    if (ingredients.length === 0) {
      alert('Добавьте ингредиенты');
      return;
    }

    const orderItems = [bun._id, ...ingredients.map(item => item._id), bun._id];
    dispatch(createOrder(orderItems));
  };

  const closeOrderModal = () => {
    dispatch(clearOrder());
    dispatch(resetLoading());
    if (order) {
      dispatch(clearConstructor());
    }
  };

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={loading}
      constructorItems={constructorItems}
      orderModalData={order}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
