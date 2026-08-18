import { Column, Text, Row } from "react-email";

const EmailHeader = () => {
  return (
    <Row className="bg-muted w-full border-b border-border rounded-t-2xl py-4 px-8">
      <Column className="w-full">
        <Text className="text-primary font-bold text-xl m-0">Una casita</Text>
      </Column>
    </Row>
  );
};

export default EmailHeader;
