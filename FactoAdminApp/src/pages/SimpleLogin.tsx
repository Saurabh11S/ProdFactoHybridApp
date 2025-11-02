import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SimpleLogin() {
  const [email, setEmail] = useState('admin@facto.org.in');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Simple form submitted!');
    console.log('Email:', email);
    console.log('Password:', password);
    alert('Form submitted! Check console for details.');
  };

  const handleButtonClick = () => {
    console.log('Button clicked directly!');
    alert('Button clicked!');
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-full max-w-md p-6 border rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Simple Login Test</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full"
              onClick={handleButtonClick}
            >
              Submit Form
            </Button>
            
            <Button 
              type="button" 
              className="w-full"
              onClick={handleButtonClick}
            >
              Direct Click Test
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Email: {email}</p>
          <p>Password: {password}</p>
        </div>
      </div>
    </div>
  );
}
