import {Section, Img, Heading, Text, Button} from "react-email";

interface HouseCardProps {
  houseName: string;
  description?: string;
  price?: string;
  houseImage?: string;
  className?: string;
  isPublished?: boolean;
  handleLink?: string;
  features?: string[];
}

const HouseCard = ({
  houseName,
  price,
  houseImage,
  className,
  description,
  handleLink,
  isPublished = true,
  features,
}: HouseCardProps) => {
  return (
    <Section
      className={`bg-muted border border-border border-solid rounded-2xl px-8 py-6 my-4 ${className || ""}`}
    >
      <Img
        src={houseImage}
        alt={houseName}
        width={520}
        height={200}
        className="w-full h-[200px] object-cover rounded-lg border border-dashed border-border bg-background mb-4"
      />
      {features && features.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {features.map((feature, index) => (
            <Text
              key={index}
              className="m-0 text-primary border border-primary border-solid rounded-full px-3 py-1 text-xs"
            >
              {feature}
            </Text>
          ))}
        </div>
      )}
      {isPublished ? (
        <PublishedCard
          houseName={houseName}
          price={price}
          houseImage={houseImage}
          description={description}
        />
      ) : (
        <SelfCard
          houseName={houseName}
          price={price}
          description={description}
        />
      )}
      {isPublished && handleLink && (
        <Button
          className="w-full bg-primary text-white rounded-full font-bold text-md text-center py-2 box-border mt-4"
          href={handleLink}
        >
          Contactar por WhatsApp
        </Button>
      )}
    </Section>
  );
};

export default HouseCard;

const SelfCard = ({
  houseName,
  price,
}: Omit<HouseCardProps, "houseImage" | "className">) => {
  return (
    <>
      <Heading m={0} className="text-lg font-title line-clamp-2">
        {houseName}
      </Heading>
      <Text className="m-0 text-md">{price}</Text>
    </>
  );
};

const PublishedCard = ({houseName, price, description}: HouseCardProps) => {
  return (
    <>
      <Text className="m-0 text-mutedForeground mb-2">{houseName}</Text>
      <Text className="m-0 text-mutedForeground mb-2">{description}</Text>
      <Text className="m-0 text-lg font-bold">{price}</Text>
    </>
  );
};
