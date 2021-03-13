import AnimatedBackgroundExample from "./examples/AnimatedBackgroundExample";
import BackgroundExample from "./examples/BackgroundExample";
import ColorsExample from "./examples/ColorsExample";
import CommonExample from "./examples/CommonExample";
import ComponentScalingExample from "./examples/ComponentScalingExample";
import LogoBackgroundExample from "./examples/LogoBackgroundExample";
import LogoExample from "./examples/LogoExample";
import NoCornerAlignmentProtectorExample from "./examples/NoCornerAlignmentProtectorExample";
import NoWhiteMarginExample from "./examples/NoWhiteMarginExample";

const Gallery = () => {
  return (
    <div className="flex flex-row justify-center p-12">
      <div className="flex-grow max-w-screen-lg">
        <div className="text-5xl font-black mb-8">AwesomeQR Examples</div>
        <div className="grid grid-cols-1 gap-8">
          <CommonExample />
          <ComponentScalingExample />
          <ColorsExample />
          <NoWhiteMarginExample />
          <NoCornerAlignmentProtectorExample />
          <BackgroundExample />
          <AnimatedBackgroundExample />
          <LogoExample />
          <LogoBackgroundExample />
        </div>
      </div>
    </div>
  );
};

export default Gallery;
