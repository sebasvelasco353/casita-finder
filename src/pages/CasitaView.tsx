import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArmchairIcon,
  ChevronLeft,
  HouseIcon,
  LoaderIcon,
  MapPin,
  MessageCircleIcon,
  PawPrintIcon,
  TriangleAlert,
} from "lucide-react";
import Layout from "../components/Layout";
import Container from "../components/Container";
import Pill from "../components/Pill";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../components/empty";
import { getPropertyById } from "../firebase/queries/properties";
import { formatPrice } from "../utils/lib";
import {
  cityLabelByValue,
  propertyTypeLabelByValue,
  zoneLabelByValue,
} from "../utils/filters";
import type { Property } from "../types";

const propertyTypeLabels: Record<Property["propertyType"], string> = {
  apartamento: "Apto.",
  casa: "Casa",
  habitacion: "Habitación",
  bodega: "Bodega",
};

export default function CasitaView() {
  const { id } = useParams<{ id: string }>();

  const {
    data: property,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getPropertyById(id as string),
    enabled: !!id,
  });

  return (
    <Layout>
      <Container className="items-start py-8">
        <a
          href="/"
          className="flex items-center gap-1 text-sm text-orange-42 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a casitas
        </a>

        {isLoading && (
          <Empty className="border border-zinc-300 border-dashed bg-white w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LoaderIcon className="animate-spin" />
              </EmptyMedia>
              <EmptyTitle>Cargando</EmptyTitle>
              <EmptyDescription>
                Espera unos segundos mientras cargamos los detalles de esta
                casita.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!isLoading && (isError || !property) && (
          <Empty className="border border-red-300 border-dashed bg-white w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-red-100">
                <TriangleAlert className="text-red-500" />
              </EmptyMedia>
              <EmptyTitle>No encontramos esta casita</EmptyTitle>
              <EmptyDescription>
                Es posible que ya no esté disponible o que el enlace sea
                incorrecto.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!isLoading && property && (
          <PropertyDetail
            property={property}
          />
        )}
      </Container>
    </Layout>
  );
}

function PropertyDetail({
  property,
}: {
  property: Property;
}) {
  const {
    cover,
    propertyType,
    city,
    zone,
    neighborhood,
    floor,
    bedrooms,
    furnished,
    petsAllowed,
    price,
    available,
    createdAt,
    contact_number
  } = property;

  const title = `${propertyTypeLabelByValue[propertyType] ?? propertyType} en ${zoneLabelByValue[zone] ?? zone}`;


  const whatsappHref = `https://wa.me/${contact_number}?text=Hola%20quisiera%20informacion%20sobre%20la%20vivienda%20al%20${zone}%20de%20${city}`;

  return (
    <div className="w-full">
      <h1 className="font-bold text-orange-18 text-3xl mb-4">{title}</h1>

      <div className="w-full aspect-video md:aspect-21/9 rounded-3xl bg-gray-91 overflow-hidden flex items-center justify-center text-orange-42/50">
        {cover ? (
          <img src={cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <HouseIcon className="w-10 h-10" />
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 mt-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-2xl bg-gray-91 flex items-center justify-center text-orange-42/50"
          >
            <HouseIcon className="w-6 h-6" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Pill variant="primary">{propertyTypeLabels[propertyType]}</Pill>
        <Pill variant="secondary">{cityLabelByValue[city] ?? city}</Pill>
        <Pill variant="secondary">
          <MapPin className="w-3 h-3" />
          {zoneLabelByValue[zone] ?? zone}
        </Pill>
        <Pill variant="secondary">{bedrooms} hab.</Pill>
        {furnished && (
          <Pill variant="tertiary">
            <ArmchairIcon className="w-3 h-3" />
            Amoblado
          </Pill>
        )}
        {petsAllowed && (
          <Pill variant="tertiary">
            <PawPrintIcon className="w-3 h-3" />
            Mascotas
          </Pill>
        )}
        <span
          className={`inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-xs font-semibold ${
            available
              ? "bg-green-100 text-green-700"
              : "bg-gray-93 text-orange-42"
          }`}
        >
          {available ? "Disponible" : "No disponible"}
        </span>
      </div>

      <p className="mt-4 font-bold text-2xl text-orange-18">
        {formatPrice(price)}
      </p>

      <div className="mt-6">
        <h2 className="font-bold text-orange-18">Ubicación</h2>
        <p className="text-sm text-orange-42 mt-1">
          {zoneLabelByValue[zone] ?? zone} · {neighborhood} ·{" "}
          {cityLabelByValue[city] ?? city} · Piso {floor}
        </p>
      </div>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-2 bg-orange-47 text-gray-99 rounded-full py-3 px-2 text-sm w-full"
      >
        <MessageCircleIcon className="w-4 h-4" />
        Contactar por WhatsApp
      </a>

      <p className="mt-4 text-xs text-orange-42/70">
        Publicado el{" "}
        {new Intl.DateTimeFormat("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(createdAt.toDate())}
      </p>

      <hr className="w-full border-orange-86 mt-6" />

      {/* TODO: agregar personas que hacen match */}
    </div>
  );
}
