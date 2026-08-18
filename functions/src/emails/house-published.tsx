import {Button, Heading, Text} from "react-email";
import Layout from "./components/Layout";
import HouseCard from "./components/HouseCard";

interface HousePublishedEmailProps {
  displayName: string;
  publishedLink?: string;
  houseImage?: string;
  houseName: string;
  price?: string;
}

export const HousePublishedEmail = ({
  displayName,
  publishedLink,
  houseImage,
  houseName,
  price,
}: HousePublishedEmailProps) => {
  return (
    <Layout
      previewText="Tu casita ya está publicada"
      title="Tu casita ya está publicada"
      footer={<Footer />}
    >
      <Heading m={0} className="text-2xl font-title">
        Tu casita ya está publicada
      </Heading>
      <Text>
        Hola {displayName}, gracias por abrir tu casa. Tu anuncio ya está activo
        y visible para las familias que están buscando dónde vivir.
      </Text>

      <HouseCard
        houseName={houseName}
        price={price}
        houseImage={houseImage}
        isPublished={false}
      />

      <Button
        className="w-full bg-primary text-white rounded-full font-bold text-md text-center py-2 box-border my-2"
        href={publishedLink}
      >
        Gestionar mi anuncio
      </Button>
    </Layout>
  );
};

HousePublishedEmail.PreviewProps = {
  displayName: "Usuario",
  publishedLink: "https://react.email",
  houseName:
    "Mi casita con texto increiblemente super largo porque quiero ver que pasa cuando se rompe el texto y se hace un overflow",
  price: "$ 1.200.000",
  houseImage:
    "https://images.pexels.com/photos/34665528/pexels-photo-34665528.jpeg",
} as HousePublishedEmailProps;

export default HousePublishedEmail;

const Footer = () => {
  return (
    <Text className="text-xs text-pretty text-mutedForeground">
      Te enviaremos un recordatorio cada 3 días para que nos confirmes que tu
      anuncio sigue activo y visible para las familias que buscan dónde vivir.
    </Text>
  );
};
