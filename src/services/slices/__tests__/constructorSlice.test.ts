import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
} from '../constructorSlice';
import { TConstructorIngredient, TIngredient } from '../../../utils/types';

// Моковые данные
const mockBun: TIngredient = {
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
};

const mockIngredient: TIngredient = {
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
};

const mockConstructorId = 'test-constructor-id-1';

describe('burgerConstructor reducer', () => {
  const initialState = {
    bun: null,
    ingredients: [],
  };

  test('должен возвращать начальное состояние при неизвестном экшене', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('должен обрабатывать addIngredient для булки', () => {
    const action = addIngredient({ item: mockBun, constructorId: mockConstructorId });
    const state = constructorReducer(initialState, action);

    expect(state.bun).not.toBeNull();
    expect(state.bun?.type).toBe('bun');
    expect(state.bun?.id).toBe(mockConstructorId);
    expect(state.ingredients).toHaveLength(0);
  });

  test('должен обрабатывать addIngredient для начинки', () => {
    const action = addIngredient({ item: mockIngredient, constructorId: mockConstructorId });
    const state = constructorReducer(initialState, action);

    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0].id).toBe(mockConstructorId);
    expect(state.ingredients[0].name).toBe('Котлета');
  });

  test('должен обрабатывать removeIngredient', () => {
    const stateWithIngredient = {
      ...initialState,
      ingredients: [{ ...mockIngredient, id: mockConstructorId }] as TConstructorIngredient[],
    };

    const action = removeIngredient(mockConstructorId);
    const state = constructorReducer(stateWithIngredient, action);

    expect(state.ingredients).toHaveLength(0);
  });

  test('должен обрабатывать moveIngredient', () => {
    const ingredients = [
      { ...mockIngredient, id: '1', name: 'Первый' },
      { ...mockIngredient, id: '2', name: 'Второй' },
    ] as TConstructorIngredient[];

    const stateWithIngredients = {
      ...initialState,
      ingredients,
    };

    const action = moveIngredient({ fromIndex: 0, toIndex: 1 });
    const state = constructorReducer(stateWithIngredients, action);

    expect(state.ingredients[0].name).toBe('Второй');
    expect(state.ingredients[1].name).toBe('Первый');
  });

  test('должен обрабатывать clearConstructor', () => {
    const stateWithData = {
      bun: { ...mockBun, id: mockConstructorId } as TConstructorIngredient,
      ingredients: [{ ...mockIngredient, id: mockConstructorId }] as TConstructorIngredient[],
    };

    const action = clearConstructor();
    const state = constructorReducer(stateWithData, action);

    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(0);
  });
});
