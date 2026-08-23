import {Button, Heading, Text} from "react-email";
import Layout from "./components/Layout";
import HouseCard from "./components/HouseCard";

export interface PropertyAutoPausedEmailProps {
  displayName: string;
  houseName: string;
  price?: string;
  houseImage?: string;
  reactivateUrl: string;
}

export const PropertyAutoPausedEmail = ({
  displayName,
  houseName,
  price,
  houseImage,
  reactivateUrl,
}: PropertyAutoPausedEmailProps) => {
  return (
    <Layout
      previewText="Pausamos tu publicación por inactividad"
      title="Pausamos tu publicación por inactividad"
      footer={<Footer />}
    >
      <Heading m={0} className="text-2xl font-title">
        Pausamos tu anuncio por inactividad
      </Heading>
      <Text>
        Hola {displayName}, como no tuvimos respuesta a los últimos recordatorios
        de disponibilidad, pausamos tu anuncio para que no sigas recibiendo
        recordatorios similares.
      </Text>

      <HouseCard
        houseName={houseName}
        price={price}
        houseImage={houseImage}
        isPublished={false}
      />

      <Text>
        ¿Tu casita sigue disponible? Puedes volver a activarla con un clic
        desde tu perfil.
      </Text>

      <Button
        className="w-full bg-primary text-white rounded-full font-bold text-md text-center py-3 box-border my-2"
        href={reactivateUrl}
      >
        Ir a mi perfil para reactivar
      </Button>
    </Layout>
  );
};

PropertyAutoPausedEmail.PreviewProps = {
  displayName: "Vecino",
  houseName: "Apartamento en Norte",
  price: "$ 1.200.000",
  houseImage:
    "https://images.pexels.com/photos/34665528/pexels-photo-34665528.jpeg",
  reactivateUrl: "https://unacasitacolombia.com/perfil",
} as PropertyAutoPausedEmailProps;

export default PropertyAutoPausedEmail;

const Footer = () => {
  return (
    <Text className="text-xs text-pretty text-mutedForeground">
      Puedes reactivar, editar o eliminar tus propiedades en cualquier momento
      ingresando a tu cuenta en Una Casita.
    </Text>
  );
};
