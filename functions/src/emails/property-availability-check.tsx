import {Button, Heading, Text, Section} from "react-email";
import Layout from "./components/Layout";
import HouseCard from "./components/HouseCard";

export interface PropertyAvailabilityCheckEmailProps {
  displayName: string;
  houseName: string;
  price?: string;
  houseImage?: string;
  confirmAvailableUrl: string;
  confirmRentedUrl: string;
}

export const PropertyAvailabilityCheckEmail = ({
  displayName,
  houseName,
  price,
  houseImage,
  confirmAvailableUrl,
  confirmRentedUrl,
}: PropertyAvailabilityCheckEmailProps) => {
  return (
    <Layout
      previewText="¿Tu casita sigue disponible?"
      title="Confirma la disponibilidad de tu casita"
      footer={<Footer />}
    >
      <Heading m={0} className="text-2xl font-title">
        ¿Tu casita sigue disponible?
      </Heading>
      <Text>
        Hola {displayName}, queremos verificar si tu publicación sigue activa
        o si ya encontraste arrendatario.
      </Text>

      <HouseCard
        houseName={houseName}
        price={price}
        houseImage={houseImage}
        isPublished={false}
      />

      <Section className="my-4">
        <Button
          className="w-full bg-primary text-white rounded-full font-bold text-md text-center py-3 box-border mb-3"
          href={confirmAvailableUrl}
        >
          Sí, sigue disponible
        </Button>
        <Button
          className="w-full bg-muted text-foreground border border-border border-solid rounded-full font-bold text-sm text-center py-2.5 box-border"
          href={confirmRentedUrl}
        >
          Ya la alquilé
        </Button>
      </Section>
    </Layout>
  );
};

PropertyAvailabilityCheckEmail.PreviewProps = {
  displayName: "Vecino",
  houseName: "Apartamento en Norte",
  price: "$ 1.200.000",
  houseImage:
    "https://images.pexels.com/photos/34665528/pexels-photo-34665528.jpeg",
  confirmAvailableUrl: "https://unacasitacolombia.com",
  confirmRentedUrl: "https://unacasitacolombia.com",
} as PropertyAvailabilityCheckEmailProps;

export default PropertyAvailabilityCheckEmail;

const Footer = () => {
  return (
    <Text className="text-xs text-pretty text-mutedForeground">
      Te enviaremos este recordatorio cada 7 días para mantener tu anuncio
      actualizado. Si no respondes tras 3 recordatorios, pausaremos la
      publicación de tu propiedad automáticamente.
    </Text>
  );
};
