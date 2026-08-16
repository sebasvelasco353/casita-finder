import { useState } from "react";
import Button from "../components/Button";
import Container from "../components/Container";
import FilterBar, { type FiltersInterface } from "../components/FilterBar";
import Pill from "../components/Pill";
import PropertyCard from "../components/PropertyCard";
import { filterProperties } from "../utils/filter";
import casitaIcon from "../assets/casita_icon.svg";
import searchIcon from "../assets/search_icon.svg";
import PublishPropertyModal from "../components/modals/PublishPropertyModal";
import Layout from "../components/Layout";
import { resolveProperties } from "../data/seed";

const properties = resolveProperties();

function Home() {
  const [filters, setFilters] = useState<FiltersInterface>({});
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  function handleFilterChange(key: keyof FiltersInterface, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const filteredProperties = filterProperties(properties, filters);

  return (
    <Layout>
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
            <Button handleClick={() => setIsPublishModalOpen(true)}>
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
            <Button
              className="max-w-52 mt-2.5 md:mt-0"
              handleClick={() => setIsPublishModalOpen(true)}
            >
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

      <PublishPropertyModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </Layout>
  );
}

export default Home;
