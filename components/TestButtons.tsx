import React from 'react';
import { Share2, ChevronRight, Check } from 'lucide-react';
import { Button } from './ui/button';
import CyberButton from './CyberButton';
import { ShareButton } from './ShareButton';

export default function TestButtons() {
  return (
    <div className="p-8 flex flex-col space-y-8 max-w-3xl mx-auto">
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-6 cyber-glow">Cyber Button Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CyberButton variant="primary">Primary</CyberButton>
          <CyberButton variant="secondary">Secondary</CyberButton>
          <CyberButton variant="accent">Accent</CyberButton>
          <CyberButton variant="outline">Outline</CyberButton>
          <CyberButton isLoading>Loading</CyberButton>
          <CyberButton icon={<ChevronRight />}>With Icon</CyberButton>
        </div>
      </div>

      <div className="glass-panel p-8">
        <h2 className="text-2xl font-bold mb-6 cyber-glow-blue">Standard Button Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      
      <div className="glass p-8">
        <h2 className="text-2xl font-bold mb-6 cyber-glow-pink">Share Button</h2>
        <div className="flex justify-center">
          <ShareButton onClick={() => alert("Share clicked")} />
        </div>
      </div>

      <div className="p-8 bg-gradient-dark rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-white">CSS Button Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="cyber-button">Cyber Button</button>
          <button className="btn-primary">Primary Button</button>
          <button className="bg-cyber-green text-black p-3 rounded-md hover:bg-cyber-green/90">Green Button</button>
          <button className="bg-cyber-pink text-white p-3 rounded-md hover:bg-cyber-pink/90">Pink Button</button>
        </div>
      </div>
    </div>
  );
} 