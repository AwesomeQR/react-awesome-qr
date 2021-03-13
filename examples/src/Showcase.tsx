import SyntaxHighlighter from "react-syntax-highlighter";
import { github as syntaxHighlighterStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";

export interface ShowcaseProps {
  title: string;
  description?: string;
  sourceCode: string;
  previewContent: React.ReactNode;
}

const Showcase = ({ title, description, sourceCode, previewContent }: ShowcaseProps) => {
  return (
    <div className="rounded-lg border border-gray-200 shadow-md px-4 pt-2 pb-4">
      <div className="text-lg font-bold text-gray-600 mb-2">{title}</div>
      {description && <div className="text-sm text-gray-600 mb-4">{description}</div>}
      <div className="flex flex-row">
        <div className="flex flex-col flex-grow mr-4">
          <div className="text-base font-bold text-gray-500 mb-1">Code</div>
          <SyntaxHighlighter
            language="jsx"
            style={syntaxHighlighterStyle}
            className="w-full h-full rounded-lg overflow-hidden"
          >
            {sourceCode}
          </SyntaxHighlighter>
        </div>
        <div className="flex flex-col">
          <div className="text-base font-bold text-gray-500 mb-1">Output</div>
          <div
            className="rounded-lg border border-gray-200 shadow-md overflow-hidden"
            style={{ width: 300, height: 300 }}
          >
            {previewContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Showcase;
