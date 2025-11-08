import React from "react";
import { FaRobot, FaBolt, FaCoins, FaShieldAlt, FaChartLine, FaBrain } from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";
import { MdAutorenew } from "react-icons/md";

const About = () => {
  return (
    <section id="about" className="about pos-rel pt-140 pb-105">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="about__content">
              <div className="sec-title mb-35">
                <h5 className="sec-title__subtitle">About Smart DeFi Router</h5>
                <h2 className="sec-title__title">
                  AI-Powered DeFi Optimization on Arc
                </h2>
              </div>
              <p className="mb-25">
                The Smart DeFi Router Agent is an revolutionary AI agent that automatically 
                optimizes your USDC placements across multiple DeFi protocols on the Arc blockchain. 
                By leveraging advanced machine learning algorithms, real-time on-chain data analysis, 
                and Arc's lightning-fast transaction speeds, we maximize your yields while minimizing 
                risk and costs.
              </p>
              <p className="mb-35">
                Simply tell the AI your investment goals—whether you want maximum yield, lowest risk, 
                or a balanced approach—and it will calculate and execute the optimal route across 
                lending protocols, liquidity pools, and staking platforms in seconds. All with 
                predictable USDC-based gas fees.
              </p>

              <div className="about__features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <FaRobot />
                  </div>
                  <div className="feature-content">
                    <h4>AI Decision Engine</h4>
                    <p>Advanced ML algorithms analyze thousands of routes to find optimal placements</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <FaBolt />
                  </div>
                  <div className="feature-content">
                    <h4>Arc Speed & Efficiency</h4>
                    <p>Instant finality and minimal USDC gas fees for maximum net returns</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <FaCoins />
                  </div>
                  <div className="feature-content">
                    <h4>USDC-Focused</h4>
                    <p>Built specifically for stablecoin finance on Arc's optimized infrastructure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="about__pillars">
              <h3 className="pillars-title">The Three Pillars</h3>
              
              <div className="pillar-card">
                <div className="pillar-header">
                  <FaBrain />
                  <h4>1. AI Pillar</h4>
                </div>
                <div className="pillar-content">
                  <ul>
                    <li><IoMdTrendingUp /> Real-time monitoring of interest rates across protocols</li>
                    <li><FaChartLine /> Machine Learning optimization algorithms</li>
                    <li><FaShieldAlt /> Risk assessment and trust scoring</li>
                    <li><MdAutorenew /> Continuous adaptation to market conditions</li>
                  </ul>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-header">
                  <FaBolt />
                  <h4>2. Arc Pillar</h4>
                </div>
                <div className="pillar-content">
                  <ul>
                    <li>⚡ Deterministic Instant Finality</li>
                    <li>💰 USDC Gas - Stable & Predictable</li>
                    <li>🚀 High-performance execution</li>
                    <li>🔗 Smart Contract Wrapper for multi-protocol management</li>
                  </ul>
                </div>
              </div>

              <div className="pillar-card">
                <div className="pillar-header">
                  <FaCoins />
                  <h4>3. USDC Pillar</h4>
                </div>
                <div className="pillar-content">
                  <ul>
                    <li>💵 Stablecoin focus for institutional finance</li>
                    <li>📊 Predictable value for yield calculations</li>
                    <li>🏦 Ideal for payment and settlement</li>
                    <li>🌐 Universal adoption across DeFi protocols</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about {
          background: #f8f9fa;
        }

        .about__content {
          padding-right: 30px;
        }

        .about__features {
          margin-top: 30px;
        }

        .feature-item {
          display: flex;
          align-items: start;
          gap: 20px;
          margin-bottom: 25px;
          padding: 20px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .feature-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 40px;
          color: #667eea;
          flex-shrink: 0;
        }

        .feature-content h4 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #1a1a1a;
        }

        .feature-content p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .about__pillars {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
          border-radius: 20px;
          color: #fff;
        }

        .pillars-title {
          text-align: center;
          font-size: 28px;
          margin-bottom: 30px;
          font-weight: 700;
        }

        .pillar-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .pillar-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(5px);
        }

        .pillar-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .pillar-header svg {
          font-size: 32px;
          color: #ffd700;
        }

        .pillar-header h4 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .pillar-content ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .pillar-content li {
          padding: 10px 0;
          padding-left: 30px;
          position: relative;
          font-size: 14px;
          line-height: 1.6;
        }

        .pillar-content li svg {
          position: absolute;
          left: 0;
          top: 12px;
          font-size: 18px;
          color: #4ade80;
        }

        @media (max-width: 992px) {
          .about__content {
            padding-right: 0;
            margin-bottom: 40px;
          }

          .about__pillars {
            padding: 30px 20px;
          }
        }
      `}</style>
    </section>
  );
};

export default About;
