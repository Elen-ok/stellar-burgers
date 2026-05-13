import { FC, memo } from 'react';
import { OrdersListUI } from '@ui';
import { TOrder } from '@utils-types';

interface OrdersListProps {
  orders: TOrder[];
}

export const OrdersList: FC<OrdersListProps> = memo(({ orders }) => {
  const orderByDate = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return <OrdersListUI orderByDate={orderByDate} />;
});
