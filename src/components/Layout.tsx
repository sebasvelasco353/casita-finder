import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-96">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
