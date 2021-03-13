import { useEffect, useState } from "react";
import { AwesomeQRCode } from "../../../lib/index";
import Showcase from "../Showcase";
import { fsImageAsDataURI, QRTEXT } from "./shared";

const LogoExample = () => {
  const [logoImage, setLogoImage] = useState<string>();

  useEffect(() => {
    (async () => setLogoImage(await fsImageAsDataURI("/TypeScript-logo.png")))();
  }, []);

  return (
    <Showcase
      title="Logo"
      description="Place a logo image into the center of the QR code."
      sourceCode={`<AwesomeQRCode
  options={{
    text: "${QRTEXT}",
    logoImage: "data:image/png;base64,...",
  }}
/>`}
      previewContent={
        logoImage && (
          <AwesomeQRCode
            options={{
              text: QRTEXT,
              logoImage: logoImage,
            }}
          />
        )
      }
    />
  );
};

export default LogoExample;
