import Button from "./components/Button";
import Container from "./components/Container";
import Header from "./components/Header";
import Pill from "./components/Pill";

function App() {
  return (
    <div className="bg-gray-96">
      <Header />
      {/* intro */}
      <section className="bg-gray-91 py-10">
        <Container className="text-center">
          <h1 className="font-bold text-orange-18 text-4xl mb-4">
            Un hogar en tiempos difíciles
          </h1>
          <p className="max-w-xl text-orange-42">
            Tras el terremoto en Colombia, buscamos conectar a quienes tienen un
            espacio disponible con quienes buscan dónde vivir.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-2.5 mt-5">
            <Button handleClick={() => console.log("click")}>
              Ofrecer una casita
            </Button>
            <Button
              variant="secondary"
              handleClick={() => console.log("click")}
            >
              Quiero una casita
            </Button>
          </div>
        </Container>
      </section>
      {/* available casitas */}
      <section>
        <Container>
          <div className="flex py-9 w-full justify-between">
            <div className="flex flex-row gap-2.5 items-center">
              <h2 className="font-bold text-3xl text-orange-18">Casitas disponibles</h2>
              <Pill variant="tertiary">10 avisos</Pill>
            </div>
            <Button handleClick={() => console.log("ofrecer casita")}>
              Ofrecer una casita
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default App;
