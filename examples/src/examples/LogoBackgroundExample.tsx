import { useEffect, useState } from "react";
import { AwesomeQRCode } from "../../../lib/index";
import Showcase from "../Showcase";
import { fsImageAsDataURI, QRTEXT } from "./shared";

const LogoBackgroundExample = () => {
  const [backgroundImage, setBackgroundImage] = useState<string>();
  const [logoImage, setLogoImage] = useState<string>();

  useEffect(() => {
    (async () => {
      setBackgroundImage(await fsImageAsDataURI("/JavaScript-logo.png"));
      setLogoImage(await fsImageAsDataURI("/TypeScript-logo.png"));
    })();
  }, []);

  return (
    <Showcase
      title="Logo & Background"
      description="Place a logo image into the center of the QR code with background."
      sourceCode={`<AwesomeQRCode
  options={{
    text: "${QRTEXT}",
    backgroundImage: "data:image/png;base64,...",
    logoImage: "data:image/png;base64,...",
  }}
/>`}
      previewContent={
        backgroundImage &&
        logoImage && (
          <AwesomeQRCode
            options={{
              text: QRTEXT,
              backgroundImage: backgroundImage,
              logoImage: logoImage,
            }}
          />
        )
      }
    />
  );
};

export default LogoBackgroundExample;
