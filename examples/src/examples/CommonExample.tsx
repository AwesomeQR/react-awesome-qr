import { AwesomeQRCode } from "../../../lib/index";
import Showcase from "../Showcase";
import { QRTEXT } from "./shared";

const CommonExample = () => {
  return (
    <Showcase
      title="Getting Started"
      sourceCode={`<AwesomeQRCode
  options={{
    text: "${QRTEXT}"
  }}
/>`}
      previewContent={<AwesomeQRCode options={{ text: QRTEXT }} />}
    />
  );
};

export default CommonExample;
