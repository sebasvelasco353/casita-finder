import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./firebase/auth";
import FirebasePage from "./firebase/FirebasePage";
import Home from "./pages/Home";
import CasitaView from "./views/CasitaView";
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
            <Route path="/firebase" element={<FirebasePage />} />
            <Route path="/property/:id/view" element={<CasitaView />} />
          </Routes>
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
