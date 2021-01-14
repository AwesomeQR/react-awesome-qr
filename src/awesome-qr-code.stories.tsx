import { Meta } from "@storybook/react/types-6-0";
import { Options, QRErrorCorrectLevel } from "awesome-qr";
import React, { useEffect, useState } from "react";
import { AwesomeQRCode } from "./awesome-qr-code";

export default {
  title: "AwesomeQRCode",
  component: AwesomeQRCode,
  argTypes: {
    colorDark: { control: "color" },
    colorLight: { control: "color" },
    correctLevel: {
      defaultValue: QRErrorCorrectLevel.M,
      control: {
        type: "select",
        options: Object.values(QRErrorCorrectLevel),
      },
    },
  },
} as Meta;

const Template = (options: Options) => {
  return (
    <div style={{ width: 400, height: 400 }}>
      <AwesomeQRCode {...options} />
    </div>
  );
};

export const Basic = Template.bind({});

export const ColorCustomized = Template.bind({});
ColorCustomized.args = {
  colorLight: "#ffc4d6",
  colorDark: "#ff5d8f",
  autoColor: false,
};

export const WithBackground = Template.bind({});
WithBackground.args = {
  backgroundImage: "/donuts.jpg",
};

export const WithGIFBackground = (options: Options) => {
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>();

  useEffect(() => {
    fetch("/kira.gif")
      .then((r) => r.blob())
      .then((blob) => blob.arrayBuffer())
      .then((ab) => setArrayBuffer(ab));
  }, []);

  if (!arrayBuffer) return <div></div>;

  return (
    <div style={{ width: 400, height: 400 }}>
      <AwesomeQRCode
        {...{
          ...options,
          gifBackground: arrayBuffer,
        }}
      />
    </div>
  );
};
WithGIFBackground.args = {};
