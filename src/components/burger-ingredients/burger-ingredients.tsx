
import { useState, useRef, useEffect, FC } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSelector } from '../../services/store';
import { TTabMode } from '@utils-types';
import { BurgerIngredientsUI } from '../ui/burger-ingredients';

export const BurgerIngredients: FC = () => {
  const { items, loading } = useSelector((state) => state.ingredients);
  const { bun, ingredients } = useSelector((state) => state.burgerConstructor);
  
  const [currentTab, setCurrentTab] = useState<TTabMode>('bun');
  const titleBunRef = useRef<HTMLHeadingElement>(null);
  const titleMainRef = useRef<HTMLHeadingElement>(null);
  const titleSaucesRef = useRef<HTMLHeadingElement>(null);

  const [bunsRef, inViewBuns] = useInView({ threshold: 0 });
  const [mainsRef, inViewFilling] = useInView({ threshold: 0 });
  const [saucesRef, inViewSauces] = useInView({ threshold: 0 });

  useEffect(() => {
    if (inViewBuns) setCurrentTab('bun');
    else if (inViewSauces) setCurrentTab('sauce');
    else if (inViewFilling) setCurrentTab('main');
  }, [inViewBuns, inViewFilling, inViewSauces]);

  const onTabClick = (tab: string) => {
    setCurrentTab(tab as TTabMode);
    if (tab === 'bun') titleBunRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'main') titleMainRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'sauce') titleSaucesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCount = (ingredientId: string, type: string) => {
    if (type === 'bun') {
      return bun && bun._id === ingredientId ? 2 : 0;
    }
    return ingredients.filter(item => item._id === ingredientId).length;
  };

  const bunsWithCount = items.filter(item => item.type === 'bun').map(item => ({
    ...item,
    count: getCount(item._id, 'bun')
  }));
  
  const mainsWithCount = items.filter(item => item.type === 'main').map(item => ({
    ...item,
    count: getCount(item._id, 'main')
  }));
  
  const saucesWithCount = items.filter(item => item.type === 'sauce').map(item => ({
    ...item,
    count: getCount(item._id, 'sauce')
  }));

  if (loading) {
    return <div className="text text_type_main-medium p-10">Загрузка ингредиентов...</div>;
  }

  if (!items || items.length === 0) {
    return <div className="text text_type_main-medium p-10">Нет ингредиентов</div>;
  }

  return (
    <BurgerIngredientsUI
      currentTab={currentTab}
      buns={bunsWithCount}
      mains={mainsWithCount}
      sauces={saucesWithCount}
      titleBunRef={titleBunRef}
      titleMainRef={titleMainRef}
      titleSaucesRef={titleSaucesRef}
      bunsRef={bunsRef}
      mainsRef={mainsRef}
      saucesRef={saucesRef}
      onTabClick={onTabClick}
    />
  );
};

export default BurgerIngredients;



