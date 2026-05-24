import { combineReducers } from '@reduxjs/toolkit';
import constructorReducer from '../constructorSlice';
import ingredientsReducer from '../ingredientsSlice';
import orderReducer from '../orderSlice';
import userReducer from '../userSlice';

const rootReducer = combineReducers({
  burgerConstructor: constructorReducer,
  ingredients: ingredientsReducer,
  order: orderReducer,
  user: userReducer,
});

describe('rootReducer', () => {
  test('при неизвестном экшене возвращает корректное начальное состояние', () => {
    const unknownAction = { type: 'UNKNOWN_ACTION' };
    const initialState = rootReducer(undefined, { type: '@@INIT' });
    const newState = rootReducer(undefined, unknownAction);
    expect(newState).toEqual(initialState);
  });
});
