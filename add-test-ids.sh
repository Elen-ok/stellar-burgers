#!/bin/bash

# Добавляем data-testid в ингредиенты (BurgerIngredientsUI)
sed -i 's/className={styles.item}/className={styles.item} data-testid="ingredient-item"/' src/components/ui/ingredients-category/ingredients-category.tsx

# Добавляем data-testid в конструктор (BurgerConstructorUI)
sed -i 's/className={styles.element}/className={styles.element} data-testid="constructor-item"/' src/components/ui/burger-constructor/burger-constructor.tsx

# Добавляем data-testid в кнопку заказа
sed -i 's/Оформить заказ/Оформить заказ<\/button>/' src/components/ui/burger-constructor/burger-constructor.tsx
sed -i 's/<button.*Оформить заказ.*/& data-testid="order-button"/' src/components/ui/burger-constructor/burger-constructor.tsx

echo "✅ data-testid добавлены"
