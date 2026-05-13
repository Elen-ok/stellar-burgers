import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrdersApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';

export const fetchProfileOrders = createAsyncThunk(
  'profileOrders/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getOrdersApi();
      console.log('getOrdersApi response:', data);
      return data;
    } catch (error: any) {
      console.error('getOrdersApi error:', error);
      return rejectWithValue(error.message);
    }
  }
);

interface ProfileOrdersState {
  orders: TOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: ProfileOrdersState = {
  orders: [],
  loading: false,
  error: null,
};

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
        console.log('ProfileOrders: загружено заказов:', state.orders.length);
      })
      .addCase(fetchProfileOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Ошибка загрузки заказов';
        console.error('ProfileOrders error:', action.payload);
      });
  },
});

export default profileOrdersSlice.reducer;
