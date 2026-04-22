import { Check, Clock, Users, FileText } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Check,
      title: "QR Code Check-In",
      description: "Scan to log visits, inspections, and maintenance.",
    },
    {
      icon: Clock,
      title: "Digital Trail",
      description: "Automatic timestamps, notes, and photo uploads.",
    },
    {
      icon: FileText,
      title: "Audit Ready",
      description: "Instant access to 24 months of records at the link a link.",
    },
    {
      icon: Users,
      title: "Multi-Access",
      description: "Separate views for contractors, building managers.",
    },
  ];

  const benefits = [
    "Meets NZ Building Act & compliance requirements",
    "User-friendly— no apps, no training needed",
    "Facility management companies",
    "Fire & compliance inspectors",
    "Councils & auditors"
  ];

  return (
    <section className="py-20 bg-gradient-section">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Why LOGS?
          </h2>
          <p className="text-xl text-muted-foreground">
            Our solution streamlines compliance record-keeping, ensuring every inspection 
            is transparent, traceable, and instantly accessible.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg bg-background shadow-soft hover:shadow-medium transition-all duration-300">
              <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Why Choose Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-primary text-center mb-12">
            Why Choose LOG-ON
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              {benefits.slice(3).map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;