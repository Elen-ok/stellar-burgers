import { combineReducers } from '@reduxjs/toolkit';
import constructorReducer from '../constructorSlice';
import ingredientsReducer from '../ingredientsSlice';
import orderReducer from '../orderSlice';
import userReducer from '../userSlice';
import feedReducer from '../feedSlice';
import profileOrdersReducer from '../profileOrdersSlice';

const rootReducer = combineReducers({
  burgerConstructor: constructorReducer,
  ingredients: ingredientsReducer,
  order: orderReducer,
  user: userReducer,
  feed: feedReducer,
  profileOrders: profileOrdersReducer,
});

describe('rootReducer', () => {
  const initialState = rootReducer(undefined, { type: '@@INIT' });

  it('должен возвращать корректное начальное состояние при неизвестном экшене', () => {
    const state = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(state).toEqual(initialState);
  });
});
