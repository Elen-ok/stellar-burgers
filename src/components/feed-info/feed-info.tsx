import { FC } from 'react';
import { useSelector } from '../../services/store';
import { FeedInfoUI } from '@ui';

export const FeedInfo: FC = () => {
  const { orders, total, totalToday } = useSelector((state) => state.feed);

  const readyOrders = orders
    .filter(order => order.status === 'done')
    .map(order => order.number)
    .slice(0, 20);
  
  const pendingOrders = orders
    .filter(order => order.status !== 'done')
    .map(order => order.number)
    .slice(0, 20);

  const feed = {
    total: total,
    totalToday: totalToday
  };

  return (
    <FeedInfoUI
      feed={feed}
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
    />
  );
};
