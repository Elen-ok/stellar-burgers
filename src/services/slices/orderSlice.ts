import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import { getCookie } from '../../utils/cookie';

interface OrderState {
  order: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  order: null,
  loading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (ingredientsIds: string[], { rejectWithValue }) => {
    try {
      // Получаем токен и добавляем Bearer
      const token = getCookie('accessToken');
      if (!token) {
        throw new Error('Нет токена авторизации');
      }
      
      // Сохраняем оригинальный fetchWithRefresh
      // Временно сохраняем оригинальный заголовок
      console.log('Отправка заказа с токеном:', `Bearer ${token}`);
      
      // Вызываем оригинальную функцию, но токен уже должен быть в cookie
      const response = await orderBurgerApi(ingredientsIds);
      return response.order;
    } catch (error: any) {
      console.error('Ошибка при создании заказа:', error);
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Ошибка';
        console.error('Order rejected:', action.payload);
      });
  },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
