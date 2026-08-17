import { useState } from "react";
import Button from "../components/Button";
import Container from "../components/Container";
import FilterBar from "../components/FilterBar";
import type { FiltersInterface } from "../utils/filters";
import FilterPills from "../components/FilterPills";
import Pill from "../components/Pill";
import PropertyCard from "../components/PropertyCard";
import casitaIcon from "../assets/casita_icon.svg";
import searchIcon from "../assets/search_icon.svg";
import PublishPropertyModal from "../components/modals/PublishPropertyModal";
import Layout from "../components/Layout";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getPaginatedProperties,
  getPropertiesCount,
} from "../firebase/queries/properties";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../components/empty";
import { LoaderIcon, TriangleAlert } from "lucide-react";

function Home() {
  const [filters, setFilters] = useState<FiltersInterface>({});
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  function handleFilterChange(key: keyof FiltersInterface, value: string) {
    setFilters((current) => {
      const next = { ...current };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  }

  const {
    isLoading,
    isError,
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["properties", filters],
    queryFn: ({ pageParam }) => getPaginatedProperties(filters, pageParam),
    initialPageParam: undefined as
      | Awaited<ReturnType<typeof getPaginatedProperties>>["nextCursor"]
      | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const properties = data?.pages.flatMap((page) => page.items) ?? [];


  const { data: propertiesCount } = useQuery({
    queryKey: ["properties-count", filters],
    queryFn: () => getPropertiesCount(filters),
  });

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
        <Container className="items-start min-h-[65vh]">
          <div className="flex flex-col md:flex-row py-9 w-full justify-between">
            <div className="flex flex-row gap-2.5 items-center">
              <h2 className="font-bold text-3xl text-orange-18">
                Casitas disponibles
              </h2>
              <Pill variant="tertiary">{propertiesCount ?? 0} avisos</Pill>
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
          <FilterPills filters={filters} onFilterChange={handleFilterChange} />

          {isLoading && <LoadingProperties />}
          {isError && <ErrorProperties />}

          {!isLoading && !isError && (
            <>
              <div className="grid md:grid-cols-3 gap-4 py-9">
                {properties.map((property) => (
                  <PropertyCard key={property.id} data={property} />
                ))}
              </div>
              {hasNextPage && (
                <Button
                  variant="secondary"
                  className="mx-auto"
                  disabled={isFetchingNextPage}
                  handleClick={() => fetchNextPage()}
                >
                  {isFetchingNextPage ? "Cargando..." : "Cargar más"}
                </Button>
              )}
            </>
          )}
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

const LoadingProperties = () => {
  return (
    <Empty className="border border-zinc-300 border-dashed bg-white mt-4">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LoaderIcon className="animate-spin" />
        </EmptyMedia>
        <EmptyTitle>Cargando</EmptyTitle>
        <EmptyDescription>
          Espera unos segundos mientras cargamos las casitas disponibles.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

const ErrorProperties = () => {
  return (
    <Empty className="border border-red-300 border-dashed bg-white mt-4">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-red-100">
          <TriangleAlert className="text-red-500" />
        </EmptyMedia>
        <EmptyTitle>Error</EmptyTitle>
        <EmptyDescription>
          Ocurrió un error al cargar las casitas disponibles. Por favor, intenta
          recargar la página o vuelve más tarde.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
