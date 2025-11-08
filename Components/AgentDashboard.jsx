import React, { useState, useEffect } from "react";
import { FaRobot, FaChartLine, FaShieldAlt, FaCoins } from "react-icons/fa";
import { IoMdTrendingUp, IoMdSwap } from "react-icons/io";
import { MdAutorenew } from "react-icons/md";

const AgentDashboard = ({ routerData, userPositions, protocols }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section id="dashboard" className="agent-dashboard pos-rel pt-140 pb-105">
      <div className="container">
        <div className="sec-title text-center mb-50">
          <h5 className="sec-title__subtitle">
            <FaRobot /> AI-Powered DeFi Router
          </h5>
          <h2 className="sec-title__title">Smart Agent Dashboard</h2>
          <p className="sec-title__text">
            Monitor your optimized USDC positions across Arc's DeFi ecosystem
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="dashboard-stats">
          <div className="row">
            <div className="col-lg-3 col-md-6">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaCoins />
                </div>
                <div className="stat-info">
                  <h4>{routerData?.totalValueLocked || "0"} USDC</h4>
                  <p>Total Value Locked</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stat-card">
                <div className="stat-icon">
                  <IoMdTrendingUp />
                </div>
                <div className="stat-info">
                  <h4>{routerData?.averageYield || "0"}% APY</h4>
                  <p>Current Yield</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaShieldAlt />
                </div>
                <div className="stat-info">
                  <h4>{routerData?.riskScore || "0"}/100</h4>
                  <p>Portfolio Risk Score</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stat-card">
                <div className="stat-icon">
                  <IoMdSwap />
                </div>
                <div className="stat-info">
                  <h4>{routerData?.activeProtocols || "0"}</h4>
                  <p>Active Protocols</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs mt-50">
          <div className="tab-buttons">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={activeTab === "positions" ? "active" : ""}
              onClick={() => setActiveTab("positions")}
            >
              My Positions
            </button>
            <button
              className={activeTab === "protocols" ? "active" : ""}
              onClick={() => setActiveTab("protocols")}
            >
              Available Protocols
            </button>
            <button
              className={activeTab === "ai" ? "active" : ""}
              onClick={() => setActiveTab("ai")}
            >
              AI Recommendations
            </button>
          </div>

          <div className="tab-content mt-30">
            {activeTab === "overview" && (
              <div className="overview-content">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="info-card">
                      <h3>
                        <FaChartLine /> Portfolio Performance
                      </h3>
                      <div className="performance-chart">
                        <div className="chart-item">
                          <span className="label">7-Day Return:</span>
                          <span className="value positive">+12.5%</span>
                        </div>
                        <div className="chart-item">
                          <span className="label">30-Day Return:</span>
                          <span className="value positive">+48.2%</span>
                        </div>
                        <div className="chart-item">
                          <span className="label">Total Earned:</span>
                          <span className="value">
                            {routerData?.totalEarned || "0"} USDC
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="info-card">
                      <h3>
                        <MdAutorenew /> Auto-Rebalance Status
                      </h3>
                      <div className="rebalance-info">
                        <p>
                          <strong>Status:</strong>{" "}
                          {routerData?.autoRebalance ? "Active" : "Inactive"}
                        </p>
                        <p>
                          <strong>Last Rebalanced:</strong>{" "}
                          {routerData?.lastRebalance || "Never"}
                        </p>
                        <p>
                          <strong>Threshold:</strong>{" "}
                          {routerData?.rebalanceThreshold || "5"}% yield drop
                        </p>
                        <button className="thm-btn mt-10">
                          Configure Rebalance
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "positions" && (
              <div className="positions-content">
                <div className="positions-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Protocol</th>
                        <th>Amount</th>
                        <th>APY</th>
                        <th>Duration</th>
                        <th>Earned</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPositions && userPositions.length > 0 ? (
                        userPositions.map((position, index) => (
                          <tr key={index}>
                            <td>{position.protocolName}</td>
                            <td>{position.amount} USDC</td>
                            <td className="positive">{position.apy}%</td>
                            <td>{position.duration} days</td>
                            <td className="positive">+{position.earned} USDC</td>
                            <td>
                              <button className="btn-small">Withdraw</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">
                            No active positions. Start optimizing your USDC!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "protocols" && (
              <div className="protocols-content">
                <div className="row">
                  {protocols && protocols.length > 0 ? (
                    protocols.map((protocol, index) => (
                      <div className="col-lg-4 col-md-6" key={index}>
                        <div className="protocol-card">
                          <div className="protocol-header">
                            <h4>{protocol.name}</h4>
                            <span
                              className={`status ${
                                protocol.isActive ? "active" : "inactive"
                              }`}
                            >
                              {protocol.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="protocol-stats">
                            <div className="stat">
                              <span className="label">Current APY:</span>
                              <span className="value positive">
                                {protocol.yield}%
                              </span>
                            </div>
                            <div className="stat">
                              <span className="label">Risk Score:</span>
                              <span
                                className={`value ${
                                  protocol.risk < 30
                                    ? "low-risk"
                                    : protocol.risk < 70
                                    ? "medium-risk"
                                    : "high-risk"
                                }`}
                              >
                                {protocol.risk}/100
                              </span>
                            </div>
                            <div className="stat">
                              <span className="label">TVL:</span>
                              <span className="value">
                                ${protocol.tvl}M
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center">
                      <p>No protocols available at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="ai-recommendations">
                <div className="recommendation-card">
                  <div className="recommendation-header">
                    <FaRobot />
                    <h3>AI Agent Recommendations</h3>
                  </div>
                  <div className="recommendation-content">
                    <div className="recommendation-item">
                      <div className="recommendation-badge optimal">
                        Optimal
                      </div>
                      <h4>Yield Optimization Opportunity</h4>
                      <p>
                        Based on current market conditions, rebalancing to
                        Protocol A (8.5% APY) and Protocol C (7.2% APY) can
                        increase your yield by 2.3% while maintaining your risk
                        profile.
                      </p>
                      <button className="thm-btn mt-10">
                        Execute Optimization
                      </button>
                    </div>

                    <div className="recommendation-item">
                      <div className="recommendation-badge moderate">
                        Moderate Risk
                      </div>
                      <h4>High-Yield Option Available</h4>
                      <p>
                        New protocol D is offering 12% APY. Risk score: 65/100.
                        Consider allocating 20% of your portfolio for
                        diversified higher returns.
                      </p>
                      <button className="thm-btn-outline mt-10">
                        Learn More
                      </button>
                    </div>

                    <div className="recommendation-item">
                      <div className="recommendation-badge safe">Safe</div>
                      <h4>Risk Reduction Suggestion</h4>
                      <p>
                        Your current risk score is 45/100. Moving 30% to
                        Protocol B (risk: 15) can lower your overall risk to
                        35/100 with only 0.5% yield reduction.
                      </p>
                      <button className="thm-btn-outline mt-10">
                        Review Strategy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .agent-dashboard {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }

        .dashboard-stats {
          margin-top: 40px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.15);
        }

        .stat-icon {
          font-size: 40px;
          color: #ffd700;
        }

        .stat-info h4 {
          font-size: 28px;
          margin: 0;
          font-weight: 700;
        }

        .stat-info p {
          margin: 5px 0 0;
          opacity: 0.8;
        }

        .dashboard-tabs {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 30px;
        }

        .tab-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .tab-buttons button {
          padding: 12px 30px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .tab-buttons button.active {
          background: #ffd700;
          color: #000;
        }

        .tab-buttons button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .info-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 20px;
        }

        .info-card h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          font-size: 22px;
        }

        .chart-item {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chart-item:last-child {
          border-bottom: none;
        }

        .value.positive {
          color: #4ade80;
          font-weight: 700;
        }

        .positions-table {
          overflow-x: auto;
        }

        .positions-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .positions-table th,
        .positions-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .positions-table th {
          background: rgba(255, 255, 255, 0.1);
          font-weight: 700;
        }

        .btn-small {
          padding: 8px 20px;
          background: #ffd700;
          color: #000;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
        }

        .protocol-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 20px;
        }

        .protocol-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .status {
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status.active {
          background: #4ade80;
          color: #000;
        }

        .status.inactive {
          background: #ef4444;
        }

        .protocol-stats .stat {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
        }

        .low-risk {
          color: #4ade80;
        }

        .medium-risk {
          color: #fbbf24;
        }

        .high-risk {
          color: #ef4444;
        }

        .recommendation-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 30px;
        }

        .recommendation-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          font-size: 24px;
        }

        .recommendation-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 25px;
          margin-bottom: 20px;
          position: relative;
        }

        .recommendation-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .recommendation-badge.optimal {
          background: #4ade80;
          color: #000;
        }

        .recommendation-badge.moderate {
          background: #fbbf24;
          color: #000;
        }

        .recommendation-badge.safe {
          background: #60a5fa;
          color: #000;
        }

        .recommendation-item h4 {
          margin: 20px 0 10px;
        }

        .thm-btn,
        .thm-btn-outline {
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .thm-btn {
          background: #ffd700;
          color: #000;
          border: none;
        }

        .thm-btn-outline {
          background: transparent;
          color: #fff;
          border: 2px solid #fff;
        }

        .thm-btn:hover {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .stat-card {
            flex-direction: column;
            text-align: center;
          }

          .tab-buttons {
            flex-direction: column;
          }

          .tab-buttons button {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default AgentDashboard;
