import { useEffect, FC, useCallback } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { fetchFeed } from '../../services/slices/feedSlice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.feed);

  const loadFeeds = useCallback(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  useEffect(() => {
    loadFeeds();
    // Обновляем каждые 10 секунд
    const interval = setInterval(loadFeeds, 10000);
    return () => clearInterval(interval);
  }, [loadFeeds]);

  if (loading && !orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={loadFeeds} />;
};

export default Feed;
