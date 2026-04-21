import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { OrderInfoUI } from '@ui';
import { getOrderByNumberApi } from '../../utils/burger-api';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { items } = useSelector((state) => state.ingredients);

  useEffect(() => {
    if (!number) return;
    
    setLoading(true);
    getOrderByNumberApi(Number(number))
      .then(res => {
        if (res.success && res.orders[0]) {
          setOrderData(res.orders[0]);
        }
      })
      .catch(err => console.error('Error loading order:', err))
      .finally(() => setLoading(false));
  }, [number]);

  if (loading && !orderData) {
    return <div className="text text_type_main-medium p-10">Загрузка заказа...</div>;
  }

  if (!orderData || !items.length) {
    return <div className="text text_type_main-medium p-10">Заказ не найден</div>;
  }

  const ingredientsInfo = orderData.ingredients.reduce((acc: any[], id: string) => {
    const ingredient = items.find(item => item._id === id);
    if (ingredient) {
      const existing = acc.find(item => item._id === id);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ ...ingredient, count: 1 });
      }
    }
    return acc;
  }, []);

  const total = ingredientsInfo.reduce((sum: number, item: any) => sum + item.price * item.count, 0);
  const date = new Date(orderData.createdAt);

  const orderInfo = {
    ...orderData,
    ingredientsInfo,
    total,
    date
  };

  return <OrderInfoUI orderInfo={orderInfo} />;
};