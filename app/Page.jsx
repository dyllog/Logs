import Head from 'next/head';
import Image from 'next/image';
import aucklandSkyline from '../public/images/auckland-skyline-standalone.jpg';

const LogsLandingPage = () => {
  return (
    <>
      <Head>
        <title>LOGS - Digital E-Logbook for NZ Building Compliance</title>
        <meta 
          name="description" 
          content="Instant access to inspection records via QR codes. Streamline your building compliance with secure, digital logbooks that meet New Zealand standards." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="LOGS - Digital E-Logbook for NZ Building Compliance" />
        <meta property="og:description" content="QR code-based inspection records for New Zealand building compliance. No more paper trails - just scan, log, and comply." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/logs-landing" />
      </Head>
      
      <main className="logs-landing">
        <div className="logs-container">
          {/* Background Image */}
          <div className="logs-background">
            <Image
              src={aucklandSkyline}
              alt="Auckland skyline"
              fill
              className="logs-bg-image"
              priority
            />
          </div>
          
          {/* Content */}
          <div className="logs-content">
            <div>
              {/* Main Title */}
              <h1 className="logs-title">LOGS</h1>
              
              {/* Subtitle */}
              <h2 className="logs-subtitle">Digital E-Logbook for NZ Building Compliance</h2>
              
              {/* Description */}
              <p className="logs-description">
                Instant access to inspection records via QR codes. Streamline your building compliance 
                with secure, digital logbooks that meet New Zealand standards. No more paper trails - 
                just scan, log, and comply.
              </p>
              
              {/* CTA Buttons */}
              <div className="logs-buttons">
                <a href="#demo" className="logs-btn-primary">
                  Try Demo
                </a>
                <a href="#contact" className="logs-btn-secondary">
                  Get Started
                </a>
              </div>
              
              {/* Features */}
              <div className="logs-features">
                <div className="logs-feature-card">
                  <div className="logs-feature-icon">📱</div>
                  <h3 className="logs-feature-title">QR Code Access</h3>
                  <p className="logs-feature-description">
                    Instant access to inspection records with a simple QR code scan. 
                    No apps to download or accounts to create.
                  </p>
                </div>
                
                <div className="logs-feature-card">
                  <div className="logs-feature-icon">🔒</div>
                  <h3 className="logs-feature-title">Secure & Compliant</h3>
                  <p className="logs-feature-description">
                    Meet all New Zealand building compliance requirements with 
                    secure cloud storage and audit trails.
                  </p>
                </div>
                
                <div className="logs-feature-card">
                  <div className="logs-feature-icon">📊</div>
                  <h3 className="logs-feature-title">Digital Records</h3>
                  <p className="logs-feature-description">
                    Replace paper logbooks with digital records that are always 
                    accessible and never lost or damaged.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Wave */}
          <svg 
            className="logs-wave"
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" />
          </svg>
        </div>

        <style jsx>{`
          .logs-landing {
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          .logs-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #10b981 100%);
            position: relative;
            overflow: hidden;
          }
          
          .logs-background {
            position: absolute;
            inset: 0;
            opacity: 0.15;
          }
          
          .logs-bg-image {
            object-fit: cover;
            object-position: center;
          }
          
          .logs-content {
            position: relative;
            z-index: 10;
            max-width: 1200px;
            margin: 0 auto;
            padding: 80px 24px;
            text-align: center;
          }
          
          .logs-title {
            font-size: 5rem;
            font-weight: bold;
            color: white;
            margin-bottom: 24px;
            letter-spacing: -0.02em;
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          
          .logs-subtitle {
            font-size: 1.875rem;
            color: rgba(255,255,255,0.95);
            margin-bottom: 32px;
            font-weight: 300;
          }
          
          .logs-description {
            font-size: 1.25rem;
            color: rgba(255,255,255,0.85);
            margin: 0 auto 48px;
            max-width: 800px;
            line-height: 1.6;
          }
          
          .logs-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 64px;
          }
          
          .logs-btn-primary, .logs-btn-secondary {
            padding: 16px 32px;
            font-size: 1.125rem;
            font-weight: 600;
            border-radius: 12px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            min-width: 180px;
          }
          
          .logs-btn-primary {
            background-color: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            backdrop-filter: blur(10px);
          }
          
          .logs-btn-primary:hover {
            background-color: rgba(255,255,255,0.3);
            transform: translateY(-2px);
          }
          
          .logs-btn-secondary {
            background-color: transparent;
            border: 2px solid white;
            color: white;
          }
          
          .logs-btn-secondary:hover {
            background-color: rgba(255,255,255,0.2);
            color: #0ea5e9;
          }
          
          .logs-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
            max-width: 1000px;
            margin: 0 auto;
          }
          
          .logs-feature-card {
            text-align: center;
            padding: 24px;
            background-color: rgba(255,255,255,0.1);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          .logs-feature-icon {
            width: 64px;
            height: 64px;
            background-color: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 24px;
          }
          
          .logs-feature-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: white;
            margin-bottom: 12px;
          }
          
          .logs-feature-description {
            color: rgba(255,255,255,0.8);
            line-height: 1.5;
          }
          
          .logs-wave {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 80px;
            fill: #ffffff;
          }
          
          @media (max-width: 768px) {
            .logs-title {
              font-size: 3rem;
            }
            
            .logs-subtitle {
              font-size: 1.5rem;
            }
            
            .logs-description {
              font-size: 1.125rem;
            }
            
            .logs-content {
              padding: 60px 16px;
            }
          }
        `}</style>
      </main>
    </>
  );
};

export default LogsLandingPage;