import { combineReducers } from '@reduxjs/toolkit';
import constructorReducer from '../constructorSlice';
import ingredientsReducer from '../ingredientsSlice';

// Создаем rootReducer в тесте
const rootReducer = combineReducers({
  burgerConstructor: constructorReducer,
  ingredients: ingredientsReducer,
});

describe('rootReducer', () => {
  test('должен возвращать корректное начальное состояние при неизвестном экшене', () => {
    const initialState = {
      burgerConstructor: {
        bun: null,
        ingredients: [],
      },
      ingredients: {
        items: [],  // ← исправлено: data → items
        loading: false,
        error: null,
      },
    };
    
    const state = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(state).toEqual(initialState);
  });
});
