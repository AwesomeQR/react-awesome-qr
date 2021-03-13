import { useEffect, useState } from "react";
import { AwesomeQRCode } from "../../../lib/index";
import Showcase from "../Showcase";
import { fsImageAsDataURI, QRTEXT } from "./shared";

const BackgroundExample = () => {
  const [backgroundImage, setBackgroundImage] = useState<string>();

  useEffect(() => {
    (async () => setBackgroundImage(await fsImageAsDataURI("/JavaScript-logo.png")))();
  }, []);

  return (
    <Showcase
      title="Background"
      description="Use an image as background for the QR code."
      sourceCode={`<AwesomeQRCode
  options={{
    text: "${QRTEXT}",
    backgroundImage: "data:image/png;base64,...",
  }}
/>`}
      previewContent={
        backgroundImage && (
          <AwesomeQRCode
            options={{
              text: QRTEXT,
              backgroundImage: backgroundImage,
            }}
          />
        )
      }
    />
  );
};

export default BackgroundExample;
