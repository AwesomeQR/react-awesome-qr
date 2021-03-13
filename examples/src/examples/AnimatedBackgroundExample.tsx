import { useEffect, useState } from "react";
import { AwesomeQRCode } from "../../../lib/index";
import Showcase from "../Showcase";
import { QRTEXT } from "./shared";

const AnimatedBackgroundExample = () => {
  const [gifArrayBuffer, setGifArrayBuffer] = useState<ArrayBuffer>();

  useEffect(() => {
    (async () => {
      const arrayBuffer = await fetch("/cat.gif").then((res) => res.arrayBuffer());
      setGifArrayBuffer(arrayBuffer);
    })();
  }, []);

  return (
    <Showcase
      title="Animated Background"
      description="Use an image as background for the QR code."
      sourceCode={`<AwesomeQRCode
  options={{
    text: "${QRTEXT}",
    gifBackground: ArrayBuffer(...),
  }}
/>`}
      previewContent={
        gifArrayBuffer && (
          <AwesomeQRCode
            options={{
              text: QRTEXT,
              backgroundDimming: "rgba(255,255,255,0.2)",
              gifBackground: gifArrayBuffer,
            }}
          />
        )
      }
    />
  );
};

export default AnimatedBackgroundExample;
