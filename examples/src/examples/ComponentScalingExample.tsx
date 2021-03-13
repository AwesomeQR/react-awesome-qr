import { AwesomeQRCode } from "../../../lib/index";
import Showcase from "../Showcase";
import { QRTEXT } from "./shared";

const ScalingExample = () => {
  return (
    <Showcase
      title="Component Scaling"
      description="Advanced scale control for components in the QR code."
      sourceCode={`<AwesomeQRCode
  options={{
    text: "${QRTEXT}",
    components: {
      data: { scale: 0.3 },
      timing: { scale: 0.35 },
      alignment: { scale: 0.35 },
      cornerAlignment: { scale: 0.35 },
    },
  }}
/>`}
      previewContent={
        <AwesomeQRCode
          options={{
            text: QRTEXT,
            components: {
              data: { scale: 0.3 },
              timing: { scale: 0.35 },
              alignment: { scale: 0.35 },
              cornerAlignment: { scale: 0.35 },
            },
          }}
        />
      }
    />
  );
};

export default ScalingExample;
