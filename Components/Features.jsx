import React from "react";
import { FaRobot, FaBolt, FaChartLine, FaShieldAlt, FaLanguage, FaSync } from "react-icons/fa";
import { MdAutorenew, MdDashboard, MdSecurity } from "react-icons/md";
import { IoMdAnalytics } from "react-icons/io";

const Features = () => {
  const features = [
    {
      icon: <FaRobot />,
      title: "AI-Powered Optimization",
      description: "Advanced machine learning algorithms analyze thousands of DeFi routes in real-time to find the optimal yield-risk balance for your USDC.",
      color: "#667eea"
    },
    {
      icon: <FaBolt />,
      title: "Arc Speed & Efficiency",
      description: "Leverage Arc's deterministic instant finality and USDC gas for lightning-fast execution with minimal, predictable costs.",
      color: "#f59e0b"
    },
    {
      icon: <FaChartLine />,
      title: "Yield Maximization",
      description: "Automatically routes your capital to the highest-performing protocols while maintaining your risk tolerance preferences.",
      color: "#10b981"
    },
    {
      icon: <MdAutorenew />,
      title: "Auto-Rebalancing",
      description: "Set it and forget it. The AI continuously monitors and rebalances your portfolio when better opportunities arise.",
      color: "#8b5cf6"
    },
    {
      icon: <FaShieldAlt />,
      title: "Risk Management",
      description: "Intelligent risk scoring and protocol trust assessment ensure your funds are allocated to safe, audited protocols.",
      color: "#ef4444"
    },
    {
      icon: <IoMdAnalytics />,
      title: "Real-Time Analytics",
      description: "Comprehensive dashboard showing your positions, yields, performance metrics, and AI recommendations.",
      color: "#06b6d4"
    },
    {
      icon: <FaLanguage />,
      title: "Natural Language Commands",
      description: "Simply tell the agent: 'Invest 1,000 USDC for 30 days with moderate risk' and it handles the rest.",
      color: "#ec4899"
    },
    {
      icon: <MdDashboard />,
      title: "Multi-Protocol Access",
      description: "Single interface to interact with multiple DeFi protocols—lending, staking, liquidity pools, and more.",
      color: "#14b8a6"
    },
    {
      icon: <MdSecurity />,
      title: "Security First",
      description: "Non-custodial, audited smart contracts. You maintain full control of your assets at all times.",
      color: "#f43f5e"
    }
  ];

  return (
    <section id="features" className="features pos-rel pt-140 pb-105">
      <div className="container">
        <div className="sec-title text-center mb-50">
          <h5 className="sec-title__subtitle">Why Choose Smart DeFi Router</h5>
          <h2 className="sec-title__title">Powerful Features for Maximum Returns</h2>
          <p className="sec-title__text">
            Combining the power of AI, Arc blockchain, and USDC stability to deliver unmatched DeFi optimization
          </p>
        </div>

        <div className="row">
          {features.map((feature, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <div className="feature-card" style={{ borderTopColor: feature.color }}>
                <div className="feature-card__icon" style={{ background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}CC 100%)` }}>
                  {feature.icon}
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Competitive Advantage Section */}
        <div className="competitive-advantage mt-80">
          <div className="sec-title text-center mb-40">
            <h2 className="sec-title__title">Competitive Advantage</h2>
          </div>

          <div className="advantage-table">
            <table>
              <thead>
                <tr>
                  <th>Aspect</th>
                  <th>Traditional DeFi</th>
                  <th>Smart DeFi Router Agent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Route Optimization</strong></td>
                  <td>Manual research & execution</td>
                  <td className="highlight">✅ AI-powered in seconds</td>
                </tr>
                <tr>
                  <td><strong>Transaction Speed</strong></td>
                  <td>Slow, variable finality</td>
                  <td className="highlight">✅ Instant with Arc</td>
                </tr>
                <tr>
                  <td><strong>Gas Fees</strong></td>
                  <td>Unpredictable, high costs</td>
                  <td className="highlight">✅ Minimal USDC gas</td>
                </tr>
                <tr>
                  <td><strong>Rebalancing</strong></td>
                  <td>Manual monitoring needed</td>
                  <td className="highlight">✅ Automated by AI</td>
                </tr>
                <tr>
                  <td><strong>User Experience</strong></td>
                  <td>Complex, technical</td>
                  <td className="highlight">✅ Natural language commands</td>
                </tr>
                <tr>
                  <td><strong>Risk Assessment</strong></td>
                  <td>Manual research</td>
                  <td className="highlight">✅ AI-driven scoring</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .features {
          background: #ffffff;
        }

        .feature-card {
          background: #fff;
          border-radius: 15px;
          padding: 35px 25px;
          margin-bottom: 30px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          border-top: 4px solid #667eea;
          transition: all 0.3s ease;
          height: calc(100% - 30px);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .feature-card__icon {
          width: 70px;
          height: 70px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: #fff;
          margin-bottom: 20px;
        }

        .feature-card__title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #1a1a1a;
        }

        .feature-card__description {
          color: #666;
          line-height: 1.7;
          margin: 0;
          font-size: 14px;
        }

        .competitive-advantage {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 60px 40px;
          border-radius: 20px;
          color: #fff;
        }

        .competitive-advantage .sec-title__title {
          color: #fff;
        }

        .advantage-table {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 30px;
          overflow-x: auto;
        }

        .advantage-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .advantage-table th,
        .advantage-table td {
          padding: 20px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .advantage-table th {
          font-weight: 700;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.1);
        }

        .advantage-table td {
          font-size: 14px;
        }

        .advantage-table tr:last-child td {
          border-bottom: none;
        }

        .advantage-table .highlight {
          color: #4ade80;
          font-weight: 700;
        }

        .advantage-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 768px) {
          .competitive-advantage {
            padding: 40px 20px;
          }

          .advantage-table {
            padding: 20px 10px;
          }

          .advantage-table th,
          .advantage-table td {
            padding: 12px 8px;
            font-size: 12px;
          }

          .feature-card {
            padding: 25px 20px;
          }
        }
      `}</style>
    </section>
  );
};

export default Features;
