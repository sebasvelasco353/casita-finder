import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import CasitaView from "./pages/CasitaView";
import EditProperty from "./pages/EditProperty";
import Profile from "./pages/Profile";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister } from "./providers/query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./providers/authFirebase";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <AuthProvider>
          <Toaster richColors position="top-center" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property/:id/view" element={<CasitaView />} />
            <Route path="/property/:id/edit" element={<EditProperty />} />
            <Route path="/perfil" element={<Profile />} />
          </Routes>
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </PersistQueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
