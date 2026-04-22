#!/bin/bash

echo "==================================="
echo "Проверка TypeScript настройки проекта"
echo "==================================="
echo ""

echo "1. Проверка TypeScript файлов:"
for file in store.ts slices/ingredientsSlice.ts slices/constructorSlice.ts slices/orderSlice.ts slices/feedSlice.ts slices/userSlice.ts; do
  if [ -f "src/services/$file" ]; then
    echo "✅ src/services/$file - существует"
  else
    echo "❌ src/services/$file - отсутствует"
  fi
done

echo ""
echo "2. Проверка компонентов:"
[ -f "src/components/protected-route/protected-route.tsx" ] && echo "✅ protected-route.tsx - существует" || echo "❌ protected-route.tsx - отсутствует"
[ -f "src/components/app/app.tsx" ] && echo "✅ app.tsx - существует" || echo "❌ app.tsx - отсутствует"

echo ""
echo "3. Проверка типов:"
[ -f "src/services/types/index.ts" ] && echo "✅ types/index.ts - существует" || echo "❌ types/index.ts - отсутствует"

echo ""
echo "4. Проверка экспортов в store.ts:"
if [ -f "src/services/store.ts" ]; then
  grep -q "export const useDispatch" src/services/store.ts && echo "✅ useDispatch экспортирован" || echo "❌ useDispatch не экспортирован"
  grep -q "export const useSelector" src/services/store.ts && echo "✅ useSelector экспортирован" || echo "❌ useSelector не экспортирован"
  grep -q "export type RootState" src/services/store.ts && echo "✅ RootState экспортирован" || echo "❌ RootState не экспортирован"
fi

echo ""
echo "==================================="
echo "Проверка завершена!"
echo "==================================="
