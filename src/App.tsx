import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./firebase/auth";
import Home from "./pages/Home";
import CasitaView from "./pages/CasitaView";
import EditProperty from "./pages/EditProperty";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./providers/query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property/:id/view" element={<CasitaView />} />
            <Route path="/property/:id/edit" element={<EditProperty />} />
          </Routes>
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
