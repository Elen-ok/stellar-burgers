import orderReducer, { createOrder, clearOrder, resetLoading } from '../orderSlice';

// Мок для API
jest.mock('../../../utils/burger-api', () => ({
  orderBurgerApi: jest.fn(),
}));

const mockOrder = {
  _id: 'order123',
  number: 12345,
  status: 'done',
  name: 'Бургер',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ingredients: ['1', '2'],
};

describe('orderSlice reducer', () => {
  const initialState = {
    order: null,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // подавляем console.error
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('должен возвращать начальное состояние при неизвестном экшене', () => {
    expect(orderReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('должен обрабатывать clearOrder', () => {
    const stateWithOrder = {
      ...initialState,
      order: mockOrder,
      error: 'some error',
    };
    const action = clearOrder();
    const state = orderReducer(stateWithOrder, action);

    expect(state.order).toBeNull();
    expect(state.error).toBeNull();
  });

  test('должен обрабатывать resetLoading', () => {
    const stateWithLoading = {
      ...initialState,
      loading: true,
    };
    const action = resetLoading();
    const state = orderReducer(stateWithLoading, action);

    expect(state.loading).toBe(false);
  });

  describe('createOrder', () => {
    test('при вызове createOrder.pending устанавливает loading=true', () => {
      const action = { type: createOrder.pending.type };
      const state = orderReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('при вызове createOrder.fulfilled сохраняет заказ и устанавливает loading=false', () => {
      const action = { type: createOrder.fulfilled.type, payload: mockOrder };
      const state = orderReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.order).toEqual(mockOrder);
      expect(state.error).toBeNull();
    });

    test('при вызове createOrder.rejected устанавливает error и loading=false', () => {
      const errorMessage = 'Ошибка создания заказа';
      const action = { type: createOrder.rejected.type, payload: errorMessage };
      const state = orderReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });
});
