import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';

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
      const response = await orderBurgerApi(ingredientsIds);
      if (!response || !response.order) {
        return rejectWithValue('Не удалось создать заказ');
      }
      return response.order;
    } catch (error: any) {
      console.error('Ошибка при создании заказа:', error);
      return rejectWithValue(error.message || 'Ошибка создания заказа');
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
    resetLoading: (state) => {
      state.loading = false;
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
        state.error = action.payload as string || 'Ошибка создания заказа';
        console.error('Order rejected:', action.payload);
      });
  },
});

export const { clearOrder, resetLoading } = orderSlice.actions;
export default orderSlice.reducer;
