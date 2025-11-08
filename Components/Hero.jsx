import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Hero = ({
  detail,
  setBuyModel,
  account,
  CONNECT_WALLET,
  setAccount,
  setLoader,
  addTokenToMetamask,
}) => {
  const notifySuccess = (msg) => toast.success(msg, { duration: 2000 });
  const notifyError = (msg) => toast.error(msg, { duration: 3000 });

  const connectWallet = async () => {
    setLoader(true);
    const address = await CONNECT_WALLET();
    setAccount(address);
  };

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const calculatePercentage = () => {
      if (!detail) return;

      const soldToken = detail?.tokenSold ?? 0;
      const tokenBalance = Number(detail?.tokenBal) ?? 0;
      const tokenTotalSupply = soldToken + tokenBalance;

      if (tokenTotalSupply === 0) {
        console.log("Token total supply is zero, cannot calculate percentage.");
        setPercentage(0);
      } else {
        const percent = (soldToken / tokenTotalSupply) * 100;
        setPercentage(percent.toFixed(2));
      }
    };

    calculatePercentage();
    const timer = setInterval(calculatePercentage, 1000);
    return () => clearInterval(timer);
  }, [detail]);

  return (
    <section
      className="hero hero__ico pos-rel"
      style={{
        backgroundImage: "url('assets/img/bg/blockchain_hero_bg.png')",
      }}
    >
      <div className="hero__shape">
        <span className="shape shape--1">
          <img src="assets/img/shape/h_shape1.png" alt="" />
        </span>
        <span className="shape shape--2">
          <img src="assets/img/shape/h_shape2.png" alt="" />
        </span>
        <span className="shape shape--3">
          <img src="assets/img/shape/h_shape3.png" alt="" />
        </span>
      </div>

      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <div className="hero__content">
              <h1 className="title mb-45">
                <span>Smart DeFi Router Agent</span> Powered by AI + Arc + USDC
              </h1>
              <p className="mb-30">
                Maximize your USDC yields with AI-driven optimization across Arc's DeFi ecosystem. 
                Our intelligent agent analyzes thousands of routes in seconds to find you the best 
                risk-adjusted returns with minimal fees.
              </p>
              <div className="btns">
                {account ? (
                  <a
                    onClick={() => setBuyModel(true)}
                    className="thm-btn"
                    style={{ cursor: "pointer" }}
                  >
                    Start Optimizing
                  </a>
                ) : (
                  <a
                    onClick={() => connectWallet()}
                    className="thm-btn"
                    style={{ cursor: "pointer" }}
                  >
                    Connect Wallet
                  </a>
                )}
                <a
                  href="#optimizer"
                  className="thm-btn thm-btn--dark ml-20"
                  style={{ cursor: "pointer" }}
                >
                  Try AI Router
                </a>
              </div>
            </div>
          </div>

          {/* <div className="col-lg-6">
            <div className="hero__explore-wrap text-center">
              <div className="hero__explore text-center pos-rel">
                <div className="hero__circle-1"></div>
                <div className="hero__circle-2"></div>
                <div className="hero__circle-3"></div>
                <div className="hero__circle-4"></div>
                <div className="hero__explore-content">
                  <h4>{detail?.tokenSold || 0} Tokens Sold</h4>
                  <p className="mb-0">{percentage || 0}% Complete</p>
                  <div className="progress-wrap mt-20">
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${percentage || 0}%` }}
                        aria-valuenow={percentage || 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                  <div className="hero__explore-info mt-30">
                    <div className="hero__explore-info-item">
                      <h6>Total Supply</h6>
                      <p>
                        {detail?.tokenBal
                          ? Number(detail.tokenBal) + (detail?.tokenSold || 0)
                          : 0}
                      </p>
                    </div>
                    <div className="hero__explore-info-item">
                      <h6>Token Price</h6>
                      <p>{detail?.tokenPrice || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          <div className="hero__progress mt-50">
            <div className="progress-title ul_li_between">
              <span>
                <span>Total Value Locked -</span> {detail?.tokenSold || "0"} USDC
              </span>
              <span>
                <span>Active Users -</span> {Math.floor((detail?.tokenSold || 0) / 1000) || "0"}
              </span>
            </div>
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${percentage || 0}%` }}
                aria-valuenow={percentage || 0}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>

            <ul className="ul_li_between">
              <li>AI Optimization</li>
              <li>Arc Speed</li>
              <li>USDC Stability</li>
            </ul>
          </div>

          <div className="col-lg-5">
            <div className="hero__explore-wrap text-center">
              <div className="hero__explore text-center">
                <div className="scroll-down">
                  <span>Explore Features</span>
                </div>
              </div>
              <div className="hero__countdown">
                <h6 className="text-center">
                  Average APY Across Protocols
                  <span className="hero__countdown-time">8.5%</span>
                </h6>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero__shape">
        <div className="shape shape--1">
          <img src="assets/img/shape/h_shape4.png" alt="" srcset="" />
        </div>
        <div className="shape shape--2">
          <img src="assets/img/shape/h_shape5.png" alt="" srcset="" />
        </div>
        <div className="shape shape--3">
          <img src="assets/img/shape/h_shape6.png" alt="" srcset="" />
        </div>
      </div>
      {/* Icon section */}
      <div className="hero__coin">
        <div className="coin coin--1">
          <img src="assets/img/icon/coin1.png" alt="" srcset="" />
        </div>
        <div className="coin coin--2">
          <img src="assets/img/icon/coin2.png" alt="" srcset="" />
        </div>
        <div className="coin coin--3">
          <img src="assets/img/icon/coin3.png" alt="" srcset="" />
        </div>
        <div className="coin coin--4">
          <img src="assets/img/icon/coin4.png" alt="" srcset="" />
        </div>
        <div className="coin coin--5">
          <img src="assets/img/icon/coin5.png" alt="" srcset="" />
        </div>{" "}
        <div className="coin coin--6">
          <img src="assets/img/icon/coin6.png" alt="" srcset="" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
