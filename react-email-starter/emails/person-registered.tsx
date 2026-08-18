import { Heading, Link, Section, Text } from "react-email";
import Layout from "./components/Layout";
import HouseCard from "./components/HouseCard";

interface PersonRegisteredEmailProps {
  displayName: string;
  removeRequestLink?: string;
  houses: {
    houseName: string;
    price?: string;
    houseImage?: string;
    description?: string;
    handleLink: string;
    features?: string[];
  }[];
}

export const PersonRegisteredEmail = ({
  displayName,
  removeRequestLink,
  houses,
}: PersonRegisteredEmailProps) => {
  const housesToShow = houses.slice(0, 3);

  const lookingFor = [
    "Apartamento",
    "Cali",
    "Sur",
    "2 Habitaciones",
    "Hasta $1.500.000",
    "Mascotas",
  ];

  return (
    <Layout
      previewText="Ya estás registrado, aquí tus primeras coincidencias"
      title="Ya estás registrado, aquí tus primeras coincidencias"
      footer={<Footer removeRequestLink={removeRequestLink} />}
    >
      <Heading m={0} className="text-2xl font-title">
        Ya estás registrado, aquí tus primeras coincidencias
      </Heading>
      <Text>
        Hola {displayName}, guardamos tu búsqueda. Te escribiremos diariamente
        con casitas que coincidan con lo que necesitas.
      </Text>

      <Section className="border border-border border-solid rounded-2xl px-6 py-4">
        <Text className="text-mutedForeground text-xs m-0">Lo que buscas</Text>
        <div className="flex flex-wrap items-center gap-0">
          {lookingFor.map((feature, index) => (
            <Text key={index} className="m-0">
              {feature}
              {index < lookingFor.length - 1 && (
                <span className="mx-1 text-mutedForeground"> • </span>
              )}
            </Text>
          ))}
        </div>
      </Section>

      {housesToShow.map((house, index) => (
        <HouseCard
          key={index}
          houseName={house.houseName}
          price={house.price}
          houseImage={house.houseImage}
          handleLink={house.handleLink}
          description={house.description}
          className="mt-6"
          isPublished
          features={house.features}
        />
      ))}
    </Layout>
  );
};

PersonRegisteredEmail.PreviewProps = {
  displayName: "Usuario",
  removeRequestLink: "https://react.email",
  houses: [
    {
      houseName: "Mi casita 1",
      price: "$ 1.200.000",
      houseImage:
        "https://images.pexels.com/photos/34665528/pexels-photo-34665528.jpeg",
      description:
        "Esta es una descripción de prueba para la casita 1, que es muy larga y debería ser truncada si es demasiado larga para el espacio disponible.",
      handleLink: "https://react.email",
      features: ["3 habitaciones", "2 baños", "1 cocina", "1 sala de estar"],
    },
    {
      houseName: "Mi casita 2",
      price: "$ 1.500.000",
      houseImage:
        "https://images.pexels.com/photos/34665528/pexels-photo-34665528.jpeg",
      description:
        "Esta es una descripción de prueba para la casita 2, que es muy larga y debería ser truncada si es demasiado larga para el espacio disponible.",
      handleLink: "https://react.email",
      features: ["4 habitaciones", "3 baños", "1 cocina", "1 sala de estar"],
    },
    {
      houseName: "Mi casita 1",
      price: "$ 1.200.000",
      houseImage:
        "https://images.pexels.com/photos/34665528/pexels-photo-34665528.jpeg",
      description:
        "Esta es una descripción de prueba para la casita 1, que es muy larga y debería ser truncada si es demasiado larga para el espacio disponible.",
      handleLink: "https://react.email",
      features: ["3 habitaciones", "2 baños", "1 cocina", "1 sala de estar"],
    },
    {
      houseName: "Mi casita 2",
      price: "$ 1.500.000",
      houseImage:
        "https://images.pexels.com/photos/34665528/pexels-photo-34665528.jpeg",
      description:
        "Esta es una descripción de prueba para la casita 2, que es muy larga y debería ser truncada si es demasiado larga para el espacio disponible.",
      handleLink: "https://react.email",
      features: ["4 habitaciones", "3 baños", "1 cocina", "1 sala de estar"],
    },
  ],
} as PersonRegisteredEmailProps;

export default PersonRegisteredEmail;

const Footer = ({ removeRequestLink }: { removeRequestLink?: string }) => {
  return (
    <Text className="text-xs text-pretty text-mutedForeground">
      ¿Ya no necesitas ayuda buscando? Puedes{" "}
      <Link href={removeRequestLink} className="text-primary">
        eliminar tu solicitud aquí
      </Link>
      .
    </Text>
  );
};
