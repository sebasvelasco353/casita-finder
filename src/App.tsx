import Button from "./components/Button";
import Container from "./components/Container";
import Header from "./components/Header";

function App() {
  return (
    <div className="bg-gray-96">
      <Header />
      <section className="bg-gray-91 py-10">
        <Container className="text-center">
          <h1>Un hogar en tiempos difíciles</h1>
          <p>
            Tras el terremoto en Colombia, buscamos conectar a quienes tienen
            un espacio disponible con quienes buscan dónde vivir.
          </p>
          <div className="flex flex-row justify-center gap-2.5 mt-5">
            <Button handleClick={() => console.log("click")}>Ofrecer una casita</Button>
            <Button variant="secondary" handleClick={() => console.log("click")}>Quiero una casita</Button>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default App;
