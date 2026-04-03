import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Layout from "./components/Layout";

const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center bg-black text-white">
                Loading...
              </div>
            }
          >
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                </Route>
              </Route>
              <Route element={<PublicRoute />}>
                <Route path="/signup" element={<Register />} />
                <Route path="/login" element={<Login />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
