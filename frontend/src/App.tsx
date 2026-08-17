import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Customers from "./pages/Customer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/customers" element={<Customers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;