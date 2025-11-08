import React, { useState } from "react";
import { FaRobot, FaCalculator, FaChartLine } from "react-icons/fa";
import { IoMdCheckmarkCircle } from "react-icons/io";

const RouteOptimizer = ({ calculateRoute, executeRoute, setLoader }) => {
  const [amount, setAmount] = useState("");
  const [targetYield, setTargetYield] = useState(5);
  const [maxRisk, setMaxRisk] = useState(50);
  const [duration, setDuration] = useState(30);
  const [autoRebalance, setAutoRebalance] = useState(true);
  const [rebalanceThreshold, setRebalanceThreshold] = useState(5);
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid USDC amount");
      return;
    }

    setIsCalculating(true);
    
    // Simulate AI calculation (in real implementation, this would call the smart contract)
    setTimeout(() => {
      const mockRoute = {
        protocols: [
          { name: "Arc Lending Protocol", allocation: 40, apy: 8.5, risk: 25 },
          { name: "Arc Staking Pool", allocation: 35, apy: 7.2, risk: 30 },
          { name: "Arc Liquidity Pool", allocation: 25, apy: 9.1, risk: 45 },
        ],
        totalExpectedYield: 8.2,
        averageRisk: 32,
        estimatedReturns: {
          daily: (amount * 0.082 / 365).toFixed(2),
          monthly: (amount * 0.082 / 12).toFixed(2),
          yearly: (amount * 0.082).toFixed(2),
        },
        gasEstimate: "~0.5 USDC",
        executionTime: "~2 seconds",
      };
      
      setCalculatedRoute(mockRoute);
      setIsCalculating(false);
    }, 2000);
  };

  const handleExecute = async () => {
    if (!calculatedRoute) {
      alert("Please calculate route first");
      return;
    }

    if (setLoader) setLoader(true);
    
    // In real implementation, call the smart contract
    try {
      // await executeRoute(amount, targetYield, maxRisk, duration);
      alert("Route execution would happen here with smart contract");
      if (setLoader) setLoader(false);
    } catch (error) {
      console.error("Error executing route:", error);
      if (setLoader) setLoader(false);
    }
  };

  return (
    <section id="optimizer" className="route-optimizer pos-rel pt-140 pb-105">
      <div className="container">
        <div className="sec-title text-center mb-50">
          <h5 className="sec-title__subtitle">
            <FaRobot /> AI-Powered Optimization
          </h5>
          <h2 className="sec-title__title">Smart Route Optimizer</h2>
          <p className="sec-title__text">
            Tell us your goals, and our AI will calculate the optimal DeFi
            route for your USDC
          </p>
        </div>

        <div className="optimizer-container">
          <div className="row">
            {/* Input Form */}
            <div className="col-lg-6">
              <div className="optimizer-form">
                <h3>
                  <FaCalculator /> Configure Your Strategy
                </h3>

                <div className="form-group">
                  <label>USDC Amount</label>
                  <input
                    type="number"
                    placeholder="Enter amount (e.g., 1000)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Target Minimum Yield (%)</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.1"
                      value={targetYield}
                      onChange={(e) => setTargetYield(e.target.value)}
                      className="slider"
                    />
                    <span className="slider-value">{targetYield}% APY</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Maximum Risk Tolerance</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={maxRisk}
                      onChange={(e) => setMaxRisk(e.target.value)}
                      className="slider"
                    />
                    <span
                      className={`slider-value ${
                        maxRisk < 30
                          ? "low-risk"
                          : maxRisk < 70
                          ? "medium-risk"
                          : "high-risk"
                      }`}
                    >
                      {maxRisk}/100 (
                      {maxRisk < 30 ? "Conservative" : maxRisk < 70 ? "Moderate" : "Aggressive"}
                      )
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Investment Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="form-select"
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">6 Months</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>

                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="autoRebalance"
                      checked={autoRebalance}
                      onChange={(e) => setAutoRebalance(e.target.checked)}
                    />
                    <label htmlFor="autoRebalance">
                      Enable Auto-Rebalancing
                    </label>
                  </div>
                  <p className="help-text">
                    Automatically rebalance when yield drops by threshold
                  </p>
                </div>

                {autoRebalance && (
                  <div className="form-group">
                    <label>Rebalance Threshold (%)</label>
                    <div className="slider-container">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={rebalanceThreshold}
                        onChange={(e) => setRebalanceThreshold(e.target.value)}
                        className="slider"
                      />
                      <span className="slider-value">
                        {rebalanceThreshold}% yield drop
                      </span>
                    </div>
                  </div>
                )}

                <button
                  className="thm-btn btn-full"
                  onClick={handleCalculate}
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <span className="spinner"></span> AI Calculating...
                    </>
                  ) : (
                    <>
                      <FaRobot /> Calculate Optimal Route
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Display */}
            <div className="col-lg-6">
              <div className="optimizer-results">
                {!calculatedRoute ? (
                  <div className="empty-state">
                    <FaChartLine />
                    <h3>Ready for Optimization</h3>
                    <p>
                      Configure your strategy on the left and click "Calculate"
                      to see AI-optimized routes
                    </p>
                  </div>
                ) : (
                  <div className="results-content">
                    <div className="results-header">
                      <IoMdCheckmarkCircle />
                      <h3>Optimal Route Calculated</h3>
                    </div>

                    <div className="results-summary">
                      <div className="summary-item">
                        <span className="label">Expected Yield:</span>
                        <span className="value positive">
                          {calculatedRoute.totalExpectedYield}% APY
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Average Risk:</span>
                        <span
                          className={`value ${
                            calculatedRoute.averageRisk < 30
                              ? "low-risk"
                              : calculatedRoute.averageRisk < 70
                              ? "medium-risk"
                              : "high-risk"
                          }`}
                        >
                          {calculatedRoute.averageRisk}/100
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Gas Fee:</span>
                        <span className="value">{calculatedRoute.gasEstimate}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Execution Time:</span>
                        <span className="value">{calculatedRoute.executionTime}</span>
                      </div>
                    </div>

                    <div className="protocol-allocation">
                      <h4>Protocol Allocation</h4>
                      {calculatedRoute.protocols.map((protocol, index) => (
                        <div key={index} className="allocation-item">
                          <div className="allocation-header">
                            <span className="protocol-name">
                              {protocol.name}
                            </span>
                            <span className="allocation-percent">
                              {protocol.allocation}%
                            </span>
                          </div>
                          <div className="allocation-bar">
                            <div
                              className="allocation-fill"
                              style={{ width: `${protocol.allocation}%` }}
                            ></div>
                          </div>
                          <div className="allocation-details">
                            <span>APY: {protocol.apy}%</span>
                            <span>Risk: {protocol.risk}/100</span>
                            <span>
                              Amount: {((amount * protocol.allocation) / 100).toFixed(2)} USDC
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="estimated-returns">
                      <h4>Estimated Returns</h4>
                      <div className="returns-grid">
                        <div className="return-item">
                          <span className="period">Daily</span>
                          <span className="amount">
                            +{calculatedRoute.estimatedReturns.daily} USDC
                          </span>
                        </div>
                        <div className="return-item">
                          <span className="period">Monthly</span>
                          <span className="amount">
                            +{calculatedRoute.estimatedReturns.monthly} USDC
                          </span>
                        </div>
                        <div className="return-item">
                          <span className="period">Yearly</span>
                          <span className="amount">
                            +{calculatedRoute.estimatedReturns.yearly} USDC
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="thm-btn btn-full" onClick={handleExecute}>
                      <IoMdCheckmarkCircle /> Execute Route
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .route-optimizer {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: #fff;
        }

        .optimizer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .optimizer-form,
        .optimizer-results {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          min-height: 600px;
        }

        .optimizer-form h3,
        .optimizer-results h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 30px;
          font-size: 24px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          font-size: 14px;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 15px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 10px;
          font-size: 16px;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .slider {
          flex: 1;
          height: 8px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.2);
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffd700;
          cursor: pointer;
        }

        .slider-value {
          min-width: 120px;
          text-align: right;
          font-weight: 700;
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

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .checkbox-group input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .help-text {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 5px;
        }

        .thm-btn {
          width: 100%;
          padding: 15px 30px;
          background: #ffd700;
          color: #000;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .thm-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 215, 0, 0.3);
        }

        .thm-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #000;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          opacity: 0.6;
        }

        .empty-state svg {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .results-content {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .results-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .results-header svg {
          font-size: 30px;
          color: #4ade80;
        }

        .results-summary {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 20px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .value.positive {
          color: #4ade80;
          font-weight: 700;
        }

        .protocol-allocation h4,
        .estimated-returns h4 {
          margin-bottom: 15px;
          font-size: 18px;
        }

        .allocation-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 15px;
        }

        .allocation-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .allocation-bar {
          height: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .allocation-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
          transition: width 0.5s ease;
        }

        .allocation-details {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          opacity: 0.8;
        }

        .returns-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .return-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 15px;
          text-align: center;
        }

        .return-item .period {
          display: block;
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 5px;
        }

        .return-item .amount {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #4ade80;
        }

        @media (max-width: 992px) {
          .optimizer-form,
          .optimizer-results {
            margin-bottom: 20px;
          }

          .returns-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default RouteOptimizer;
