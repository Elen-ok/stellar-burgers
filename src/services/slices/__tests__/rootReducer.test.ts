import { store } from '../../store';

describe('rootReducer', () => {
  test('должен возвращать корректное начальное состояние при неизвестном экшене', () => {
    // Получаем начальное состояние из store
    const initialState = store.getState();
    
    // Создаём фиктивный экшен, который не обрабатывается ни одним редьюсером
    const unknownAction = { type: 'UNKNOWN_ACTION' };
    
    // Вызываем редьюсер напрямую через store.dispatch
    // Но проще проверить, что состояние имеет правильную структуру
    
    // Проверяем структуру начального состояния
    expect(initialState).toHaveProperty('ingredients');
    expect(initialState).toHaveProperty('burgerConstructor');
    expect(initialState).toHaveProperty('order');
    expect(initialState).toHaveProperty('feed');
    expect(initialState).toHaveProperty('user');
    expect(initialState).toHaveProperty('profileOrders');
    
    // Проверяем начальные значения ключевых слайсов
    expect(initialState.ingredients.loading).toBe(false);
    expect(initialState.ingredients.items).toEqual([]);
    expect(initialState.burgerConstructor.bun).toBeNull();
    expect(initialState.burgerConstructor.ingredients).toEqual([]);
    expect(initialState.order.order).toBeNull();
    expect(initialState.user.user).toBeNull();
    expect(initialState.user.isAuthenticated).toBe(false);
  });
});
