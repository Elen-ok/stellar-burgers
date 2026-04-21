import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { IngredientDetailsUI } from '@ui';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { items } = useSelector((state) => state.ingredients);
  const ingredient = items.find(item => item._id === id);

  if (!ingredient) {
    return <div className="text text_type_main-medium p-10">Ингредиент не найден</div>;
  }

  return <IngredientDetailsUI ingredientData={ingredient} />;
};
