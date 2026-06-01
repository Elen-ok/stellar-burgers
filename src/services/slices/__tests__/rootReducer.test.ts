import { configureStore } from '@reduxjs/toolkit';
import ingredientsReducer from '../ingredientsSlice';
import constructorReducer from '../constructorSlice';
import orderReducer from '../orderSlice';
import feedReducer from '../feedSlice';
import userReducer from '../userSlice';
import profileOrdersReducer from '../profileOrdersSlice';

// Создаем редьюсер такой же, как в store.ts
const rootReducer = {
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  order: orderReducer,
  feed: feedReducer,
  user: userReducer,
  profileOrders: profileOrdersReducer,
};

describe('rootReducer', () => {
  it('должен возвращать корректное начальное состояние при неизвестном экшене', () => {
    const store = configureStore({
      reducer: rootReducer
    });
    
    const initialState = store.getState();
    const unknownAction = { type: 'UNKNOWN_ACTION' };
    
    // Проверяем, что все слайсы присутствуют с правильными именами
    expect(initialState).toHaveProperty('ingredients');
    expect(initialState).toHaveProperty('burgerConstructor');
    expect(initialState).toHaveProperty('order');
    expect(initialState).toHaveProperty('feed');
    expect(initialState).toHaveProperty('user');
    expect(initialState).toHaveProperty('profileOrders');
    
    // Проверяем, что начальное состояние соответствует редьюсерам слайсов
    expect(initialState.ingredients).toEqual(ingredientsReducer(undefined, unknownAction));
    expect(initialState.burgerConstructor).toEqual(constructorReducer(undefined, unknownAction));
    expect(initialState.order).toEqual(orderReducer(undefined, unknownAction));
    expect(initialState.feed).toEqual(feedReducer(undefined, unknownAction));
    expect(initialState.user).toEqual(userReducer(undefined, unknownAction));
    expect(initialState.profileOrders).toEqual(profileOrdersReducer(undefined, unknownAction));
  });
});
