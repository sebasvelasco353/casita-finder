import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./firebase/auth";
import FirebasePage from "./firebase/FirebasePage";
import Home from "./pages/Home";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./providers/query";

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/firebase" element={<FirebasePage />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
