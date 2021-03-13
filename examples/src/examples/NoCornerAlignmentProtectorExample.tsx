import { AwesomeQRCode } from "../../../lib/index";
import Showcase from "../Showcase";
import { QRTEXT } from "./shared";

const NoCornerAlignmentProtectorExample = () => {
  return (
    <Showcase
      title="Disable Protector For Corner Alignment"
      description="Hide the translucent protector under the corner alignment."
      sourceCode={`<AwesomeQRCode
  options={{
    text: "${QRTEXT}",
    colorDark: "#E3655B",
    colorLight: "#F0ADA8",
    components: {
      cornerAlignment: { protectors: false },
    },
  }}
/>`}
      previewContent={
        <AwesomeQRCode
          options={{
            text: QRTEXT,
            colorDark: "#E3655B",
            colorLight: "#F0ADA8",
            components: {
              cornerAlignment: { protectors: false },
            },
          }}
        />
      }
    />
  );
};

export default NoCornerAlignmentProtectorExample;
