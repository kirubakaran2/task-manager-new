// components/VerifyCode.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface VerifyCodeProps {
  length: number;
  onComplete: (code: string) => void;
}

const VerifyCode: React.FC<VerifyCodeProps> = ({ length, onComplete }) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Handle input change
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newCode = [...code];
    newCode[index] = value.substring(0, 1);
    setCode(newCode);

    // If input isn't empty and isn't the last one, focus the next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all inputs are filled
    if (newCode.every(digit => digit !== '')) {
      onComplete(newCode.join(''));
    }
  };

  // Handle key down events for backspace and arrow navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // If current input is empty and backspace is pressed, focus previous input
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move to previous input on left arrow
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      // Move to next input on right arrow
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste event to fill multiple inputs at once
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return; // Only allow digits

    const digits = pastedData.substring(0, length).split('');
    const newCode = [...code];
    
    digits.forEach((digit, index) => {
      newCode[index] = digit;
    });
    
    setCode(newCode);
    
    // Focus the input after the last pasted digit
    const focusIndex = Math.min(digits.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
    
    // Check if we've filled all inputs
    if (newCode.every(digit => digit !== '')) {
      onComplete(newCode.join(''));
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 my-8">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          className="text-black w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
        />
      ))}
    </div>
  );
};

export default VerifyCode;