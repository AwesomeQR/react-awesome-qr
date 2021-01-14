import { AwesomeQR, Options } from "awesome-qr";
import React, { useEffect, useRef, useState } from "react";

export type AwesomeQRCodeState = "working" | "idle";
export interface AwesomeQRCodeProps extends Partial<Options> {
  onStateChange?: (state: AwesomeQRCodeState) => void;
}

export const AwesomeQRCode: React.FC<AwesomeQRCodeProps> = (
  props: AwesomeQRCodeProps
) => {
  const { onStateChange } = props;
  const options = { ...props };
  delete options.onStateChange;

  const asyncDrawSerial = useRef<number>(0);
  const [qrDataUri, setQrDataUri] = useState<string>();

  useEffect(() => {
    (async () => {
      if (asyncDrawSerial.current >= Number.MAX_SAFE_INTEGER) {
        asyncDrawSerial.current = 0;
      } else {
        asyncDrawSerial.current++;
      }
      const snapshotSerial = asyncDrawSerial.current;
      const instance = new AwesomeQR(options);
      onStateChange && onStateChange("working");
      instance.draw().then((dataUri: string) => {
        if (snapshotSerial !== asyncDrawSerial.current) return;
        setQrDataUri(dataUri);
        onStateChange && onStateChange("idle");
      });
    })();
  }, [options]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundImage: `url(${qrDataUri})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
      }}
    />
  );
};

AwesomeQRCode.defaultProps = {
  ...AwesomeQR._defaultOptions,
  size: 400,
};
