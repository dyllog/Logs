import { Button } from "@/components/ui/button";
import qrIcon from "@/assets/qr-icon.jpg";

const About = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                  LOG-ON
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Simple, secure, compliant.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">
                    ABOUT US
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Log-On provides a smarter way to manage building compliance records. 
                    With QR-enabled check-in and inspection logs, we make it easy for building 
                    owners, contractors, and auditors to keep accurate, accessible records — 
                    without the hassle of paper logbooks.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">
                    OUR MISSION
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To simplify compliance record-keeping, ensuring that every inspection 
                    is transparent, traceable, and instantly accessible.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="default" size="lg">
                  Learn More About Our Solution
                </Button>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="text-center lg:text-left">
              <div className="bg-muted rounded-2xl p-8 shadow-medium">
                <div className="flex justify-center lg:justify-start mb-6">
                  <img 
                    src={qrIcon} 
                    alt="QR Code" 
                    className="w-48 h-48 rounded-lg shadow-soft"
                  />
                </div>
                
                <h3 className="text-2xl font-bold text-primary mb-4">
                  SCAN HERE TO LOG-ON
                </h3>
                
                <div className="w-16 h-1 bg-primary mx-auto lg:mx-0 mb-4"></div>
                
                <p className="text-xl text-foreground font-medium">
                  Your compliance, one scan away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;