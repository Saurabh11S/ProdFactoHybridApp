import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function TestLogin() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('Test button clicked!');
    setCount(count + 1);
    alert(`Button clicked ${count + 1} times!`);
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Login Button</h1>
        <p className="mb-4">Click count: {count}</p>
        <Button 
          onClick={handleClick}
          className="w-full max-w-md"
        >
          Test Button Click
        </Button>
        <p className="mt-4 text-sm text-gray-600">
          If this button works, the issue is with the form submission.
        </p>
      </div>
    </div>
  );
}
