import { useEffect, FC } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { fetchFeed } from '../../services/slices/feedSlice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.feed);

  useEffect(() => {
    console.log('Feed: диспатчим fetchFeed');
    dispatch(fetchFeed());
  }, [dispatch]);

  const handleGetFeeds = () => {
    console.log('Feed: ручное обновление');
    dispatch(fetchFeed());
  };

  console.log('Feed: orders в store:', orders);
  console.log('Feed: loading:', loading);

  if (loading && !orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};

export default Feed;
