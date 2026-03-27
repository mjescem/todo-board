import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import { Provider } from "react-redux";
import { store } from "./app/store";

function App() {

  return (
    <Provider store={store}>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Register />} />
      </Routes>
    </Router>
    </Provider>
  );
}

export default App
