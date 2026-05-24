import { configureStore } from '@reduxjs/toolkit';
import constructorReducer from '../constructorSlice';
import ingredientsReducer from '../ingredientsSlice';
import orderReducer from '../orderSlice';
import userReducer from '../userSlice';
import feedReducer from '../feedSlice';
import profileOrdersReducer from '../profileOrdersSlice';

// Функция для получения начального состояния редьюсера
const getInitialState = (reducer: any) => {
  return reducer(undefined, { type: '@@INIT' });
};

describe('rootReducer', () => {
  test('при неизвестном экшене возвращает корректное начальное состояние', () => {
    // Создаём store
    const store = configureStore({
      reducer: {
        ingredients: ingredientsReducer,
        burgerConstructor: constructorReducer,
        order: orderReducer,
        feed: feedReducer,
        user: userReducer,
        profileOrders: profileOrdersReducer,
      },
    });
    
    const unknownAction = { type: 'UNKNOWN_ACTION' };
    
    // Получаем начальное состояние
    const initialState = store.getState();
    
    // Диспатчим неизвестный экшен
    store.dispatch(unknownAction);
    const newState = store.getState();
    
    // Состояние не должно измениться
    expect(newState).toEqual(initialState);
    
    // Дополнительная проверка: начальные состояния редьюсеров
    expect(newState.burgerConstructor).toEqual(getInitialState(constructorReducer));
    expect(newState.ingredients).toEqual(getInitialState(ingredientsReducer));
    expect(newState.order).toEqual(getInitialState(orderReducer));
    expect(newState.user).toEqual(getInitialState(userReducer));
    expect(newState.feed).toEqual(getInitialState(feedReducer));
    expect(newState.profileOrders).toEqual(getInitialState(profileOrdersReducer));
  });
});
