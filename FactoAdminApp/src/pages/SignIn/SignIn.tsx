import React, { ChangeEvent, FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AUTH } from "@/api/signin";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "@/context/GlobalContext";
import { useToast } from "@/hooks/use-toast";

interface FormValues {
  email: string;
  password: string;
}

export default function SignIn() {
  const [formData, setFormData] = React.useState<FormValues>({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveUser, setIsAuthenticated } = useGlobalContext();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🔐 Login attempt started');
    console.log('📧 Email:', formData.email);
    console.log('🔑 Password:', formData.password);
    
    try {
      console.log('📡 Making API call...');
      console.log('📦 Request data:', { email: formData.email, password: '***' });
      const response = await AUTH.PostLogin(formData);
      console.log('✅ API response:', response);
      
      if (response.success) {
        console.log('🎉 Login successful!');
        console.log('👤 User data:', response.data.user);
        console.log('🎫 Token:', response.data.token);
        
        saveUser(response.data.user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setIsAuthenticated(true);
        
        if (response.data.user.role === "admin") {
          const message = response.status?.message || response.message || "Login successful!";
          toast({ description: message }); 
          navigate("/dashboard");
        } else {
          toast({ description: "You are not authorized to access this page" }); 
        }
      } else {
        const errorMessage = response.status?.message || response.message || "Login failed";
        console.log('❌ Login failed:', errorMessage);
        toast({ description: errorMessage, variant: "destructive" }); 
      }
    } catch (error: any) {
      console.error('💥 Login error:', error);
      
      // Extract error message from response
      let errorMessage = "An error occurred. Please try again.";
      
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('📡 Error response:', {
          status,
          data,
          message: data?.status?.message || data?.message || data?.error?.message
        });
        
        // Backend error structure: { status: { code, success }, error: { message }, message }
        const backendMessage = data?.message || data?.error?.message || data?.status?.message;
        
        if (status === 401) {
          errorMessage = backendMessage || "Invalid email or password. Please check your credentials.";
        } else if (status === 404) {
          errorMessage = backendMessage || "User not found. Please check your email.";
        } else if (status === 400) {
          errorMessage = backendMessage || "Invalid request. Please check your input.";
        } else {
          errorMessage = backendMessage || `Server error (${status}). Please try again later.`;
        }
      } else if (error.request) {
        // Request made but no response
        console.error('❌ No response received:', error.request);
        
        // Check if it's a network/CORS error (backend not running)
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('CORS')) {
          errorMessage = "Backend server is not running. Please start the backend server on http://localhost:8080";
        } else {
          errorMessage = "Unable to connect to server. Please ensure the backend is running on http://localhost:8080";
        }
      } else {
        // Error setting up request
        console.error('❌ Request setup error:', error.message);
        errorMessage = error.message || "An unexpected error occurred.";
      }
      
      toast({ 
        description: errorMessage,
        variant: "destructive"
      }); 
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Card className="w-full max-w-md shadow-lg p-6 rounded-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your email and password to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="**********"
                value={formData.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full mt-4"
              onClick={() => console.log('Button clicked!')}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
