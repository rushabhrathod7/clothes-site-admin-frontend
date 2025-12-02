import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, error, clearError, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      toast.success("Reset link sent to your email if it exists in our system");
    } catch (error) {
      toast.error(error.message || "Failed to send reset link");
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
          </div>
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-6 border-b">
              <CardTitle className="text-2xl font-bold text-center text-gray-800">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                If {email} exists in our system, we've sent a password reset
                link
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="bg-blue-50 p-6 rounded-full mb-6">
                <Mail size={32} className="text-blue-600" />
              </div>
              <p className="text-center text-gray-600 mb-6">
                Please check your email and follow the instructions to reset
                your password. The link will expire in 30 minutes.
              </p>
              <Link to="/signin">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-6 border-b">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your admin email address and we'll send you a link to reset
              your password
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pt-0">
            <div className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/signin"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Back to sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
