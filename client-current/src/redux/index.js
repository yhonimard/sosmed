import { configureStore } from "@reduxjs/toolkit"
import rootReducer from "./root.reducer"
import { persistStore } from "redux-persist"

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
})


const persistor = persistStore(store)


export default {
  store,
  persistor
}