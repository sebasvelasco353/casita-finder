import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./firebase/auth";
import Home from "./pages/Home";
import CasitaView from "./pages/CasitaView";
import EditProperty from "./pages/EditProperty";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister } from "./providers/query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  return (
    <BrowserRouter>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property/:id/view" element={<CasitaView />} />
            <Route path="/property/:id/edit" element={<EditProperty />} />
          </Routes>
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </PersistQueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
