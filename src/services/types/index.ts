import { TIngredient, TConstructorIngredient, TOrder, TUser } from '../../utils/types';

export type IngredientsState = {
  items: TIngredient[];
  loading: boolean;
  error: string | null;
};

export type ConstructorState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
};

export type FeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
};

export type OrderState = {
  order: TOrder | null;
  loading: boolean;
  error: string | null;
};

export type UserState = {
  user: TUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};
