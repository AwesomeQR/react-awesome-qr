import { Options } from "awesome-qr";
import { AwesomeQR } from "awesome-qr/dist/awesome-qr";
import React, { useEffect, useMemo, useRef, useState } from "react";

const asyncDraw = async (instance: AwesomeQR, serial: number) => {
  const dataUri = (await instance.draw()) as string;
  return { dataUri, serial };
};

export const AwesomeQRCode: React.FC<Partial<Options>> = (
  options: Partial<Options>
) => {
  const asyncDrawSerial = useRef<number>(0);

  const qrInstance = useMemo(() => new AwesomeQR(options), [options]);
  const [qrDataUri, setQrDataUri] = useState<string>();

  useEffect(() => {
    if (qrInstance) {
      (async () => {
        const snapshotSerial = asyncDrawSerial.current;
        if (asyncDrawSerial.current >= Number.MAX_SAFE_INTEGER) {
          asyncDrawSerial.current = 0;
        } else {
          asyncDrawSerial.current++;
        }
        const { dataUri, serial } = await asyncDraw(qrInstance, snapshotSerial);
        if (snapshotSerial !== serial) return;
        setQrDataUri(dataUri);
      })();
    }
  }, [qrInstance]);

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

AwesomeQRCode.defaultProps = AwesomeQR._defaultOptions;
