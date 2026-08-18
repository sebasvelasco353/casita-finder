import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import CasitaView from "./pages/CasitaView";
import EditProperty from "./pages/EditProperty";
import PublishProperty from "./pages/PublishProperty";
import Profile from "./pages/Profile";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { defaultShouldDehydrateQuery } from "@tanstack/react-query";
import { queryClient, persister } from "./providers/query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./providers/authFirebase";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          dehydrateOptions: {
            // "properties" pages carry Firestore QueryDocumentSnapshot cursors
            // as pageParams; those don't survive a JSON round-trip (they come
            // back as an inert {bundle: "NOT SUPPORTED"} placeholder), which
            // broke pagination into duplicate pages after a reload. Let that
            // query refetch fresh instead of persisting a cursor it can't use.
            shouldDehydrateQuery: (query) =>
              query.queryKey[0] !== "properties" &&
              defaultShouldDehydrateQuery(query),
          },
        }}
      >
        <AuthProvider>
          <Toaster richColors position="top-center" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property/new" element={<PublishProperty />} />
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
