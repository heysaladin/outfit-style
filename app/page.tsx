import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-6 text-center">
        
        {/* Logo or Brand */}
        <h1 className="text-6xl font-bold text-white mb-4">
          "Outfit Style"
        </h1>
        
        {/* Coming Soon Text */}
        <p className="text-xl text-slate-300 mb-8">
          Your Smart Wardrobe Assistant
        </p>
        
        {/* Description */}
        <p className="text-slate-400 mb-4 max-w-md mx-auto">
          Plan your outfits effortlessly. Organize your wardrobe. 
          Never wonder what to wear again.
        </p>
        
        <p className="text-slate-300 font-medium mb-12">
          Get planning wardrobe as easy as possible.
        </p>
        
        {/* Email Notify Form */}
        <div className="flex gap-2 max-w-md mx-auto mb-8">
          <Input 
            type="email" 
            placeholder="Get notified when we launch" 
            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
          />
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Notify Me
          </Button>
        </div>
        
        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto text-slate-300 text-sm">
          <div>
            <div className="text-2xl mb-2">👔</div>
            <div>Outfit Planning</div>
          </div>
          <div>
            <div className="text-2xl mb-2">📅</div>
            <div>Weekly Schedule</div>
          </div>
          <div>
            <div className="text-2xl mb-2">🔄</div>
            <div>Smart Rotation</div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
