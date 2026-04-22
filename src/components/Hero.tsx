import { Button } from "@/components/ui/button";
import { QrCode, Shield, Download } from "lucide-react";
import aucklandSkyline from "@/assets/auckland-skyline-new.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${aucklandSkyline})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <h1 className="text-7xl md:text-8xl font-bold text-primary-foreground mb-6 tracking-tight">
            LOGS
          </h1>
          
          {/* Tagline */}
          <h2 className="text-2xl md:text-3xl text-primary-foreground/90 mb-8 font-light">
            Building Compliance Made Simple
          </h2>
          
          {/* Description */}
          <p className="text-xl text-primary-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            LOGS provides a modern, digital logbook for inspections and compliance — accessible 
            via QR codes on-site, secure cloud storage, and instant reporting.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="xl" className="min-w-48">
              Try a Demo
            </Button>
            <Button variant="outline" size="xl" className="min-w-48 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Contact Us
            </Button>
          </div>
          
          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <QrCode className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-foreground mb-2">Simple Logging</h3>
              <p className="text-primary-foreground/70">
                QR codes link directly to digital inspection forms. Easy to use, even for non-technical staff.
              </p>
            </div>
            
            <div className="text-center">
              <Shield className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-foreground mb-2">Secure Records</h3>
              <p className="text-primary-foreground/70">
                All data stored securely in the cloud, ensuring compliance with record keeping requirements.
              </p>
            </div>
            
            <div className="text-center">
              <Download className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-foreground mb-2">Easy Exports</h3>
              <p className="text-primary-foreground/70">
                Download PDF records instantly for audits. 24 months of data available at your fingertips.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="w-full h-16 fill-background"
        >
          <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;