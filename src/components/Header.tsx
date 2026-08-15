import Container from "./Container";

export default function Header() {
  return (
    <header className="bg-gray-98">
      <Container className="py-4 flex flex-row items-center justify-between">
        <span className="logo">Una Casita</span>
        <nav className="flex gap-2.5">
          <a className="py-1 px-3" href="/casitas">
            Casitas
          </a>
          <a className="py-1 px-3" href="/bodegas">
            Bodegaje
          </a>
        </nav>
      </Container>
    </header>
  );
}
