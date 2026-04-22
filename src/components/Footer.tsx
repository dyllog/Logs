import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold mb-4">LOGS</h3>
              <p className="text-primary-foreground/80 mb-4 max-w-md">
                Building compliance made simple through digital logbooks, 
                QR code access, and secure cloud storage.
              </p>
              <p className="text-sm text-primary-foreground/60">
                Trusted by building owners, contractors, and auditors across New Zealand.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Demo</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          <Separator className="bg-primary-foreground/20 mb-6" />
          
          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-primary-foreground/60">
            <p>© 2024 LOGS. All rights reserved.</p>
            <p>Building compliance solutions for New Zealand</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;