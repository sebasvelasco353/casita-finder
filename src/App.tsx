import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./firebase/auth";
import FirebasePage from "./firebase/FirebasePage";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/firebase" element={<FirebasePage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
