import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/Home";
import PublicRoute from "./routes/PublicRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
            </Route>
            <Route element={<PublicRoute />}>
              <Route path="/signup" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Route>
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App
