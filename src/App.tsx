import { useState } from "react";
import Button from "./components/Button";
import Container from "./components/Container";
import FilterBar, { type FiltersInterface } from "./components/FilterBar";
import Header from "./components/Header";
import Pill from "./components/Pill";
import PropertyCard, {
  type PropertyDataInterface,
} from "./components/PropertyCard";
import { filterProperties } from "./utils/filter";
import casitaIcon from "./assets/casita_icon.svg";
import searchIcon from "./assets/search_icon.svg";
import Footer from "./components/Footer";

// Mock data
const properties: PropertyDataInterface[] = [
  {
    id: "3Jc8xQmZ1k3r3t3fdf32P0aVh2N9bT",
    imageUrl: null,
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "Norte",
    neighborhood: "Ingenio",
    floor: "2",
    bedrooms: 2,
    furnished: true,
    petsAllowed: true,
    contactName: "Nicolas",
    whatsappNumber: "573001234567",
    price: 1500000,
  },
  {
    id: "3Jc8xQmZ1k3r3t3fdf3muytrt42P0aVh2N9bT",
    imageUrl: null,
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "Norte",
    neighborhood: "Ciudad Jardin",
    floor: "2",
    bedrooms: 2,
    furnished: true,
    petsAllowed: true,
    contactName: "Nicolas",
    whatsappNumber: "573001234567",
    price: 15900000,
  },
  {
    id: "3Jc8xQmZ1k3r3t322evbrtfdf32P0aVh2N9bT",
    imageUrl: null,
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "Norte",
    neighborhood: "Ingenio",
    floor: "2",
    bedrooms: 2,
    furnished: true,
    petsAllowed: true,
    contactName: "Nicolas",
    whatsappNumber: "573001234567",
    price: 150000,
  },
  {
    id: "7Rt4vLpX9mef2ghtnbefvW3cYd6Q1sK",
    imageUrl: null,
    available: true,
    propertyType: "casa",
    city: "Medellín",
    zone: "Occidente",
    neighborhood: "Laureles",
    floor: "1",
    bedrooms: 3,
    furnished: false,
    petsAllowed: false,
    contactName: "Camila",
    whatsappNumber: "573109876543",
    price: 0,
  },
  {
    id: "9FgH2nJk5pL8x2efqfwZv0mQ3e",
    imageUrl: null,
    available: false,
    propertyType: "habitacion",
    city: "Bogotá",
    zone: "Centro",
    neighborhood: "La Candelaria",
    floor: "3",
    bedrooms: 1,
    furnished: true,
    petsAllowed: false,
    contactName: "Andrés",
    whatsappNumber: "573112345678",
    price: 600000,
  },
  {
    id: "3Jc8xQmZ1kP0aVwrntfh2N9bT",
    imageUrl: null,
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "Norte",
    neighborhood: "Ingenio",
    floor: "2",
    bedrooms: 2,
    furnished: true,
    petsAllowed: true,
    contactName: "Nicolas",
    whatsappNumber: "573001234567",
    price: 1500000,
  },
  {
    id: "7Rt4vLpX9mW3cYefsrd6Q1sK",
    imageUrl: null,
    available: true,
    propertyType: "casa",
    city: "Medellín",
    zone: "Occidente",
    neighborhood: "Laureles",
    floor: "1",
    bedrooms: 3,
    furnished: false,
    petsAllowed: false,
    contactName: "Camila",
    whatsappNumber: "573109876543",
    price: 2200000,
  },
  {
    id: "9FgH2nJk5pL8xZvbrsw0mQ3e",
    imageUrl: null,
    available: false,
    propertyType: "habitacion",
    city: "Bogotá",
    zone: "Centro",
    neighborhood: "La Candelaria",
    floor: "3",
    bedrooms: 1,
    furnished: true,
    petsAllowed: false,
    contactName: "Andrés",
    whatsappNumber: "573112345678",
    price: 600000,
  },
  {
    id: "3Jc8xQmZ1kP0aVh2N9bT",
    imageUrl: null,
    available: true,
    propertyType: "apartamento",
    city: "Cali",
    zone: "Norte",
    neighborhood: "Ingenio",
    floor: "2",
    bedrooms: 2,
    furnished: true,
    petsAllowed: true,
    contactName: "Nicolas",
    whatsappNumber: "573001234567",
    price: 1500000,
  },
  {
    id: "7Rt4vLpX9mW324fdwcYd6Q1sK",
    imageUrl: null,
    available: true,
    propertyType: "casa",
    city: "Medellín",
    zone: "Occidente",
    neighborhood: "Laureles",
    floor: "1",
    bedrooms: 3,
    furnished: false,
    petsAllowed: false,
    contactName: "Camila",
    whatsappNumber: "573109876543",
    price: 2200000,
  },
  {
    id: "9FgH2nJk5pL8xZh52wfwhv0mQ3e",
    imageUrl: null,
    available: false,
    propertyType: "habitacion",
    city: "Bogotá",
    zone: "Centro",
    neighborhood: "La Candelaria",
    floor: "3",
    bedrooms: 1,
    furnished: true,
    petsAllowed: false,
    contactName: "Andrés",
    whatsappNumber: "573112345678",
    price: 600000,
  },
];

function App() {
  const [filters, setFilters] = useState<FiltersInterface>({});

  function handleFilterChange(key: keyof FiltersInterface, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const filteredProperties = filterProperties(properties, filters);

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
              <img src={casitaIcon} alt="" className="w-4 h-4" />
              Ofrecer una casita
            </Button>
            <Button
              variant="secondary"
              handleClick={() => console.log("click")}
            >
              <img src={searchIcon} alt="" className="w-4 h-4" />
              Quiero una casita
            </Button>
          </div>
        </Container>
      </section>
      {/* available casitas */}
      <section>
        <Container className="items-start">
          <div className="flex flex-col md:flex-row py-9 w-full justify-between">
            <div className="flex flex-row gap-2.5 items-center">
              <h2 className="font-bold text-3xl text-orange-18">
                Casitas disponibles
              </h2>
              <Pill variant="tertiary">{filteredProperties.length} avisos</Pill>
            </div>
            <Button className="max-w-52 mt-2.5 md:mt-0" handleClick={() => console.log("click")}>
              <img src={casitaIcon} alt="" className="w-4 h-4" />
              Ofrecer una casita
            </Button>
          </div>
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
          <div className="grid md:grid-cols-4 gap-4 py-9">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} propertyData={property} />
            ))}
          </div>
        </Container>
      </section>
      <Footer />
    </div>
  );
}

export default App;
