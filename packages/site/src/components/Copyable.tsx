import { useState } from 'react';

interface CopyableProps {
  message: string;
}

export const Copyable = ({ message }: CopyableProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div>
      <span>{message}</span>
      <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
    </div>
  );
};
