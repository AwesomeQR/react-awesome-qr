import { AwesomeQR, Options } from "awesome-qr";
import Promise from "bluebird";
import React, { useEffect, useRef, useState } from "react";

export type AwesomeQRCodeState = "working" | "idle";
export interface AwesomeQRCodeProps {
  options: Partial<Options>;
  onStateChange?: (state: AwesomeQRCodeState) => void;
}

export const AwesomeQRCode: React.FC<AwesomeQRCodeProps> = ({ options, onStateChange }: AwesomeQRCodeProps) => {
  const currentTask = useRef<Promise<string>>();
  const [qrDataUri, setQrDataUri] = useState<string>();

  useEffect(() => {
    if (currentTask.current && !currentTask.current.isFulfilled && !currentTask.current.isCancelled) {
      currentTask.current.cancel();
    }
    currentTask.current = new Promise((resolve) => {
      const instance = new AwesomeQR(options);
      onStateChange && onStateChange("working");
      instance.draw().then((dataUri) => resolve(dataUri as string));
    });
    currentTask.current.then((dataUri) => {
      setQrDataUri(dataUri as string);
      onStateChange && onStateChange("idle");
    });
  }, [options]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
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
    </div>
  );
};

const a = (
  <AwesomeQRCode
    options={{
      text: "Awesome-qr.js",
      // ...
    }}
    onStateChange={(state: AwesomeQRCodeState) => {
      switch (state) {
        case "working":
          // ...
          break;
        case "idle":
          // ...
          break;
      }
    }}
  />
);

AwesomeQRCode.defaultProps = {
  options: AwesomeQR.defaultOptions,
};
