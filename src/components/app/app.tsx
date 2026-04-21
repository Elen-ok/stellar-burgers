
import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { fetchIngredients } from '../../services/slices/ingredientsSlice';
import { fetchUser } from '../../services/slices/userSlice';
import { ProtectedRoute } from '../protected-route/protected-route';
import { AppHeader } from '../app-header/app-header';

import { ConstructorPage } from '../../pages/constructor-page/constructor-page';
import { Feed } from '../../pages/feed/feed';
import { Login } from '../../pages/login/login';
import { Register } from '../../pages/register/register';
import { ForgotPassword } from '../../pages/forgot-password/forgot-password';
import { ResetPassword } from '../../pages/reset-password/reset-password';
import { Profile } from '../../pages/profile/profile';
import { ProfileOrders } from '../../pages/profile-orders/profile-orders';
import { NotFound404 } from '../../pages/not-found-404/not-found-404';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { OrderInfo } from '../order-info/order-info';
import { Modal } from '../modal/modal';

import styles from './app.module.css';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state?.background;
  const { isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchIngredients());
    const token = localStorage.getItem('refreshToken');
    if (token && !isAuthenticated) {
      dispatch(fetchUser());
    }
  }, [dispatch, isAuthenticated]);

  const handleModalClose = () => {
    navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background || location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
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
        <Route path="/ingredients/:id" element={<IngredientDetails />} />
        <Route path="/feed/:number" element={<OrderInfo />} />
        <Route path="/profile/orders/:number" element={
          <ProtectedRoute>
            <OrderInfo />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/ingredients/:id" element={
            <Modal title="Детали ингредиента" onClose={handleModalClose}>
              <IngredientDetails />
            </Modal>
          } />
          <Route path="/feed/:number" element={
            <Modal title="Детали заказа" onClose={handleModalClose}>
              <OrderInfo />
            </Modal>
          } />
          <Route path="/profile/orders/:number" element={
            <Modal title="Детали заказа" onClose={handleModalClose}>
              <OrderInfo />
            </Modal>
          } />
        </Routes>
      )}
    </div>
  );
}

export default App;

