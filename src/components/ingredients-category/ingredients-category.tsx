import { forwardRef, useMemo } from 'react';
import { useSelector } from '../../services/store';
import { IngredientsCategoryUI } from '../ui/ingredients-category';

interface IngredientsCategoryProps {
  title: string;
  titleRef?: React.RefObject<HTMLHeadingElement>;
  ingredients: any[];
}

export const IngredientsCategory = forwardRef<
  HTMLUListElement,
  IngredientsCategoryProps
>(({ title, titleRef, ingredients }, ref) => {
  const { bun, ingredients: constructorIngredients } = useSelector(
    (state) => state.burgerConstructor
  );

  const ingredientsCounters = useMemo(() => {
    const counters: { [key: string]: number } = {};
    constructorIngredients.forEach((ingredient: any) => {
      if (!counters[ingredient._id]) counters[ingredient._id] = 0;
      counters[ingredient._id]++;
    });
    if (bun) counters[bun._id] = 2;
    return counters;
  }, [bun, constructorIngredients]);

  return (
    <IngredientsCategoryUI
      title={title}
      titleRef={titleRef as React.RefObject<HTMLHeadingElement>}
      ingredients={ingredients}
      ingredientsCounters={ingredientsCounters}
      ref={ref}
    />
  );
});
