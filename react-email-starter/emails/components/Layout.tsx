import {
  Html,
  Head,
  Tailwind,
  Body,
  Preview,
  Container,
  Section,
  Font,
  Text,
} from "react-email";
import EmailHeader from "./Header";
import { emailTailwindConfig } from "../tailwind-config";

interface LayoutProps {
  children: React.ReactNode;
  previewText?: string;
  title?: string;
  footer?: React.ReactNode;
}

export default function Layout({
  children,
  previewText,
  title,
  footer,
}: LayoutProps) {
  return (
    <Html lang="es">
      <Head>
        {title && <title>{title}</title>}
        <Font
          fontFamily="Bitter"
          fallbackFontFamily="Georgia"
          fontWeight={400}
          fontStyle="normal"
          webFont={{
            url: "https://fonts.gstatic.com/s/bitter/v42/raxhHiqOu8IVPmnRc6SY1KXhnF_Y8fbfCL8.ttf",
            format: "truetype",
          }}
        />
        <Font
          fontFamily="Bitter"
          fallbackFontFamily="Georgia"
          fontWeight={700}
          fontStyle="normal"
          webFont={{
            url: "https://fonts.gstatic.com/s/bitter/v42/raxhHiqOu8IVPmnRc6SY1KXhnF_Y8RHYCL8.ttf",
            format: "truetype",
          }}
        />
        <Font
          fontFamily="Arial"
          fallbackFontFamily={["Helvetica", "sans-serif"]}
        />
      </Head>
      <Tailwind config={emailTailwindConfig}>
        <Body lang="es" className="bg-background text-foreground py-10">
          {previewText && <Preview>{previewText}</Preview>}
          <Container>
            <Section className="bg-card border border-border border-solid rounded-2xl">
              <EmailHeader />
              <Section className="px-8 py-6">{children}</Section>
              {footer && (
                <Section className="bg-muted border-t border-border rounded-b-2xl px-8">
                  {footer}
                </Section>
              )}
            </Section>

            <Text className="text-center text-xs text-foreground mt-6 opacity-50">
              Con amor, de Colombianos para Colombianos ❤️
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
