import React from 'react';

type Props = {
  text?: string | null;
};

// Renders text but forces program references like DCP/YY/MM/NNNN to be rendered LTR
export default function TextWithProgramRef({ text }: Props) {
  if (!text) return null;

  // Match DCP/2023/09/1234 or DCP/23/09/1234 etc. Capture whole ref
  const refRegex = /(DCP\/\d{2,4}\/\d{1,2}\/\d{1,6})/g;

  const parts = text.split(refRegex).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        if (refRegex.test(part)) {
          return (
            <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
              <span dir="ltr">{part}</span>
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
