import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowRight, ShieldCheck, Globe, Activity } from "lucide-react";

export default function Login() {
  const [location, setLocation] = useLocation();
  const [username, setUsername] = useState("walchlaw4");
  const [password, setPassword] = useState("eJs3M*LnfSSo68P!RtXC9lZ");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden bg-white/50 backdrop-blur-sm">
        {/* Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100 blur-[120px] opacity-40 animate-pulse" />

        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-md z-10 ring-1 ring-slate-900/5">
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 transform rotate-3 hover:rotate-0 transition-all duration-300">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-slate-500 mt-2 text-base">
                Sign in to your SEO Automation Hub
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-medium">Username or Email</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <Input 
                    id="username" 
                    placeholder="name@example.com" 
                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">Forgot password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 group text-lg font-medium rounded-xl">
                Sign In
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>Secured with Enterprise-Grade Encryption</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex lg:w-[600px] bg-slate-900 text-white relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900/90" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SEO Hub</span>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Automate your SEO workflow with AI precision
          </h2>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Streamline content creation, optimize for search engines, and publish across platforms with our unified dashboard.
          </p>
        </div>

        <div className="relative z-10 grid gap-6">
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Real-time Analytics</h3>
              <p className="text-sm text-slate-400">Monitor performance metrics instantly</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Global Distribution</h3>
              <p className="text-sm text-slate-400">Publish to WordPress & Socials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
