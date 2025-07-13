// components/VerifyCode.tsx
import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface VerifyCodeProps {
  length?: number;
  onComplete?: (code: string) => void;
}

const VerifyCode = ({ length = 6, onComplete }: VerifyCodeProps) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
    // Focus the first input on component mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [length]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.substring(0, 1);
    setCode(newCode);

    // Auto-focus next input if current input is filled
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all fields are filled
    if (value && index === length - 1 && newCode.every(digit => digit !== '') && onComplete) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // If current input is empty, focus previous input
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted content is a number with correct length
    if (/^\d+$/.test(pastedData) && pastedData.length <= length) {
      const newCode = [...code];
      
      // Fill the boxes with pasted digits
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      
      setCode(newCode);
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      // Call onComplete if all fields are filled
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="mb-6">
      <p className="text-center text-gray-600 mb-4">Enter verification code</p>
      
      <div className="flex justify-center gap-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={code[index] || ''}
ref={(el) => {
  inputRefs.current[index] = el;
}} 
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        ))}
      </div>
    </div>
  );
};

export default VerifyCode;
