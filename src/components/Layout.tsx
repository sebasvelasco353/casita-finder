import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-96 min-h-dvh flex flex-col">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
