import { Heading, Link, Text } from "react-email";
import Layout from "./components/Layout";
import HouseCard from "./components/HouseCard";

interface PersonRegisteredUpdatesProps {
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
}: PersonRegisteredUpdatesProps) => {
  const housesToShow = houses.slice(0, 3);

  return (
    <Layout
      previewText="Ya estás registrado, aquí tus primeras coincidencias"
      title="Ya estás registrado, aquí tus primeras coincidencias"
      footer={<Footer removeRequestLink={removeRequestLink} />}
    >
      <Heading m={0} className="text-2xl font-title">
        Nuevas casitas que podrían interesarte
      </Heading>
      <Text>
        Hola {displayName}, estas es una selección de las casitas nuevas o
        actualizadas desde la última actualización que coinciden con tu
        búsqueda.
      </Text>

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

      <Text>
        Si quieres ver todas las casitas que coinciden con tu búsqueda, puedes
        ir a tu{" "}
        <Link href={removeRequestLink} className="text-primary">
          panel de control
        </Link>{" "}
        y ver todas las casitas que coinciden con tu búsqueda.
      </Text>
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
} as PersonRegisteredUpdatesProps;

export default PersonRegisteredEmail;

const Footer = ({ removeRequestLink }: { removeRequestLink?: string }) => {
  return (
    <Text className="text-xs text-pretty text-mutedForeground">
      Si ya encontraste dónde vivir,{" "}
      <Link href={removeRequestLink} className="text-primary">
        elimina tu solicitud
      </Link>{" "}
      y dejarás de recibir estos correos.
    </Text>
  );
};
