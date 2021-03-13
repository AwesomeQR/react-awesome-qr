import { AwesomeQRCode } from "../../../lib/index";
import Showcase from "../Showcase";
import { QRTEXT } from "./shared";

const NoWhiteMarginExample = () => {
  return (
    <Showcase
      title="Remove White Margins"
      description="Remove the white margins around the QR code."
      sourceCode={`<AwesomeQRCode
  options={{
    text: "${QRTEXT}",
    colorDark: "#7EBC89",
    colorLight: "#C1DBB3",
    whiteMargin: false,
  }}
/>`}
      previewContent={
        <AwesomeQRCode
          options={{
            text: QRTEXT,
            colorDark: "#7EBC89",
            colorLight: "#C1DBB3",
            whiteMargin: false,
          }}
        />
      }
    />
  );
};

export default NoWhiteMarginExample;
