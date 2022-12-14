import {
  AnyAction,
  combineReducers,
  Reducer,
  ReducersMapObject,
} from "@reduxjs/toolkit";
import { ReducerManager, StateSchema, StateSchemaKey } from "./stateSchema";

// https://redux.js.org/usage/code-splitting
// предназанчен для того, чтоб в реальном времени подгружать/удалять редьюсеры в стейте
// на вход подается начальные редьюсеры
export function createReducerManager(
  initialReducers: ReducersMapObject<StateSchema>
): ReducerManager {
  const reducers = { ...initialReducers };
  // создаем корневой редьюсер из списка редьюсеров
  let combinedReducer = combineReducers(reducers);
  // массив для названий редьюсеров, которые мы хотим удалить
  let keysToRemove: StateSchemaKey[] = [];
  return {
    // функци получения всех редьюсеров
    getReducerMap: () => reducers,
    // обычная функция, которая проверяет, что если какие-то редьюсеры есть в keysToRemove, то она их удаляет из стейта
    reduce: (state: StateSchema, action: AnyAction) => {
      if (keysToRemove.length > 0) {
        state = { ...state };
        keysToRemove.forEach((key) => delete state[key]);
        // после цикла очищаем массив
        keysToRemove = [];
      }
      // и возвращаем новый редьюсер, в который передаем новый стейт без ненужных ключей
      return combinedReducer(state, action);
    },
    // эта функция, которая по ключу добавляет новый редьюсер в главный редьюсер
    add: (key: StateSchemaKey, reducer: Reducer) => {
      if (!key || reducers[key]) {
        return;
      }
      reducers[key] = reducer;
      combinedReducer = combineReducers(reducers);
    },
    // эту функция добавляет ключ в массив для удаления и удаляет его из главного редьюсера
    remove: (key: StateSchemaKey) => {
      if (!key || !reducers[key]) {
        return;
      }
      delete reducers[key];
      keysToRemove.push(key);
      combinedReducer = combineReducers(reducers);
    },
  };
}
