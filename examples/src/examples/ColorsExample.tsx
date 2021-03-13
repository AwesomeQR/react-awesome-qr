import { AwesomeQRCode } from "../../../lib/index";
import Showcase from "../Showcase";
import { QRTEXT } from "./shared";

const ColorsExample = () => {
  return (
    <Showcase
      title="Colors"
      description="Define colors for the QR code."
      sourceCode={`<AwesomeQRCode
  options={{
    text: "${QRTEXT}",
    colorDark: "#7EBC89",
    colorLight: "#C1DBB3",
  }}
/>`}
      previewContent={
        <AwesomeQRCode
          options={{
            text: QRTEXT,
            colorDark: "#7EBC89",
            colorLight: "#C1DBB3",
          }}
        />
      }
    />
  );
};

export default ColorsExample;
