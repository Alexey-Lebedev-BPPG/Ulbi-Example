import { Reducer } from "@reduxjs/toolkit";
import {
  ReduxStoreWithManager,
  StateSchemaKey,
} from "app/providers/StoreProvider/config/stateSchema";
import React, { FC, useEffect } from "react";
import { useDispatch, useStore } from "react-redux";

// тип для всех редьюсеров, которые будут поступать в наш компонент (если передадим несколько редьюсеров)
export type ReducersList = {
  [keyReducer in StateSchemaKey]?: Reducer;
};

// тип для перебора массива переданных редьсеров
type ReducerListEntry = [StateSchemaKey, Reducer];

interface IDynamicModuleLoaderProps {
  reducers: ReducersList;
  // флаг, чтоб можно было удалять редьюсер после размонтирования
  removeAfterUnmount?: boolean;
}

// обертка для использования асинхронных редьюсеров в асинхронных компонентах
export const DynamicModuleLoader: FC<IDynamicModuleLoaderProps> = ({
  children,
  reducers,
  removeAfterUnmount,
}) => {
  const dispatch = useDispatch();
  // получаем стор, чтоб посмотреть что там
  const store = useStore() as ReduxStoreWithManager;

  // делаем юзеффект, в котором будем подгружать/удалять используемые редьюсеры в данном компоненте
  useEffect(() => {
    // пробегаем по объекту редьюсеров, создаем на каждой итерации массив из названия редьюсера и самого редьюсера и выполняем необходимые действия
    Object.entries(reducers).forEach(
      ([keyReducer, reducer]: ReducerListEntry) => {
        // это позволяет изолировать редьюсер внути модуля и в паблик апи его можно удалять. Этот редьюсер будет подгружаться только тогда, когда будет загружен данный компонент
        store.reducerManager.add(keyReducer, reducer);
        // чтоб просматривать сработало ли или нет (если убрать, то действие сработает, однако в девтулзах не обновится. Обновление происходит после следущего действия)
        dispatch({ type: `@INIT ${keyReducer} reducer` });
      }
    );

    // при демонтировании компонента, редьюсер также удаляется из стора
    return () => {
      if (removeAfterUnmount) {
        Object.entries(reducers).forEach(([keyReducer]: ReducerListEntry) => {
          store.reducerManager.remove(keyReducer);
          // чтоб просматривать сработало ли или нет (если убрать, то действие сработает, однако в девтулзах не обновится. Обновление происходит после следущего действия)
          dispatch({ type: `@DESTROY ${keyReducer} reducer` });
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
