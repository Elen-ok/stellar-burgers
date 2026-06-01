import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '../../../utils/types';

// Мок для API
jest.mock('../../../utils/burger-api', () => ({
  getIngredientsApi: jest.fn(),
}));

import { getIngredientsApi } from '../../../utils/burger-api';

const mockIngredients: TIngredient[] = [
  {
    _id: '1',
    name: 'Булка',
    type: 'bun',
    price: 50,
    image: '',
    image_large: '',
    image_mobile: '',
    proteins: 10,
    fat: 5,
    carbohydrates: 30,
    calories: 200,
  },
  {
    _id: '2',
    name: 'Котлета',
    type: 'main',
    price: 100,
    image: '',
    image_large: '',
    image_mobile: '',
    proteins: 20,
    fat: 15,
    carbohydrates: 10,
    calories: 300,
  },
];

describe('ingredientsSlice reducer', () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('должен возвращать начальное состояние при неизвестном экшене', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  describe('fetchIngredients', () => {
    test('при вызове fetchIngredients.pending устанавливает loading=true', () => {
      const action = { type: fetchIngredients.pending.type };
      const state = ingredientsReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.items).toEqual([]);
    });

    test('при вызове fetchIngredients.fulfilled загружает ингредиенты и устанавливает loading=false', () => {
      const action = { type: fetchIngredients.fulfilled.type, payload: mockIngredients };
      const state = ingredientsReducer(initialState, action);

      expect(state.loading).toBe(false);
     expect(state.items).toEqual(mockIngredients);
      expect(state.error).toBeNull();
    });

    test('при вызове fetchIngredients.rejected устанавливает error и loading=false', () => {
      const errorMessage = 'Ошибка загрузки ингредиентов';
      const action = { type: fetchIngredients.rejected.type, error: { message: errorMessage } };
      const state = ingredientsReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.items).toEqual([]);
      expect(state.error).toBe(errorMessage);
    });
  });
});
