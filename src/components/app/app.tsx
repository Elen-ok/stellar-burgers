import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';
import { AppHeader, Modal, OrderInfo, IngredientDetails } from '@components';
import { ProtectedRoute } from '../protected-route';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';
import styles from './app.module.css';
import '../../index.css';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const background = location.state?.background;
  
  const { items, loading, error } = useSelector((state) => state.ingredients);

  useEffect(() => {
    if (items.length === 0 && !loading) {
      dispatch(fetchIngredients());
    }
  }, [dispatch, items.length, loading]);

  const handleModalClose = () => {
    navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background || location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/:number" element={<OrderInfo />} />
        <Route path="/ingredients/:id" element={<IngredientDetails />} />

        <Route path="/login" element={
          <ProtectedRoute anonymous>
            <Login />
          </ProtectedRoute>
        } />
        <Route path="/register" element={
          <ProtectedRoute anonymous>
            <Register />
          </ProtectedRoute>
        } />
        <Route path="/forgot-password" element={
          <ProtectedRoute anonymous>
            <ForgotPassword />
          </ProtectedRoute>
        } />
        <Route path="/reset-password" element={
          <ProtectedRoute anonymous>
            <ResetPassword />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/profile/orders" element={
          <ProtectedRoute>
            <ProfileOrders />
          </ProtectedRoute>
        } />
        <Route path="/profile/orders/:number" element={
          <ProtectedRoute>
            <OrderInfo />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/feed/:number" element={
            <Modal title={`#${location.pathname.split('/').pop()}`} onClose={handleModalClose}>
              <OrderInfo />
            </Modal>
          } />
          <Route path="/profile/orders/:number" element={
            <Modal title="Детали заказа" onClose={handleModalClose}>
              <ProtectedRoute>
                <OrderInfo />
              </ProtectedRoute>
            </Modal>
          } />
        </Routes>
      )}
    </div>
  );
};

export default App;