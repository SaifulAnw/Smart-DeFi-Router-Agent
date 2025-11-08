import React, { useState, useEffect } from "react";

const Header = ({
  account,
  CONNECT_WALLET,
  setAccount,
  setLoader,
  setOwnerModel,
  shortenAddress,
  detail,
  currency,
  ownerModel,
}) => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || null);
    };

    if (typeof window.ethereum !== "undefined") {
      setIsMetaMaskInstalled(true);

      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, [setAccount]);

  const connectMetamask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.log("Error connecting to Metamask:", error);
      }
    } else {
      console.log("Please install Metamask extension!");
    }
  };

  return (
    <header className="site-header header--transparent ico-header">
      <div className="header__main-wrap flex ">
        <div className="container mxw_1640">
          <div className="header__main ul_li_between">
            <div className="header__left ul_li">
              <div className="header__logo">
                <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src="assets/img/logo/logo.svg" alt="Smart DeFi Router" srcSet="" />
                  <span style={{
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "20px",
                    background: "linear-gradient(135deg, #ffd700 0%, #667eea 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "inline-block"
                  }}>
                    Smart DeFi Router
                  </span>
                </a>
              </div>
            </div>

            <div className="main-menu__wrap ul_li navbar navbar-expand-xl ">
              <nav className="main-menu collapse navbar-collapse ">
                <ul
                  style={{ display: "flex", flexDirection: "row", gap: "2rem" }}
                >
                  <li className="active has-mega-menu">
                    <a href="/">Home</a>
                  </li>
                  <li className="scrollspy-btn">
                    <a href="#about">About</a>
                  </li>
                  <li className="scrollspy-btn">
                    <a href="#features">Features</a>
                  </li>
                  <li className="scrollspy-btn">
                    <a href="#optimizer">AI Router</a>
                  </li>
                  <li className="scrollspy-btn">
                    <a href="#dashboard">Dashboard</a>
                  </li>
                  <li className="scrollspy-btn">
                    <a href="#faq">FAQ</a>
                  </li>
                  <li className="scrollspy-btn">
                    <a href="#contact">Contact</a>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="header__action ul_li">
              <div className="d-xl-none">
                <a
                  href="javascript:void(0);"
                  className="header__bar ham hamburger_menu"
                >
                  <div className="header__bar-icon">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </a>
              </div>

              {detail?.address && detail?.owner && 
               detail.address.toLowerCase() === detail.owner.toLowerCase() && (
                <div style={{ marginRight: "15px" }}>
                  <a
                    onClick={() => setOwnerModel(!ownerModel)}
                    style={{ 
                      cursor: "pointer",
                      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      color: "#fff",
                      fontWeight: "600",
                      display: "inline-block",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 5px 15px rgba(239, 68, 68, 0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    🔧 Admin
                  </a>
                </div>
              )}

              {account ? (
                <div className="header__account">
                  <a
                    onClick={() =>
                      navigator.clipboard.writeText(detail?.address)
                    }
                    style={{ 
                      cursor: "pointer",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      color: "#fff",
                      fontWeight: "600",
                      display: "inline-block",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 5px 15px rgba(102, 126, 234, 0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {shortenAddress(detail?.address)}: {detail?.maticBal?.slice(0, 6)} {currency}
                  </a>
                </div>
              ) : (
                <div className="header__account">
                  <a
                    onClick={() => connectMetamask()}
                    style={{ 
                      cursor: "pointer",
                      background: "#ffd700",
                      color: "#000",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      display: "inline-block",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 10px rgba(255, 215, 0, 0.3)"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 5px 20px rgba(255, 215, 0, 0.5)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 10px rgba(255, 215, 0, 0.3)";
                    }}
                  >
                    Connect Wallet
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .header__main-wrap {
          background: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        .main-menu ul li a {
          color: #fff !important;
          font-weight: 600;
          font-size: 15px;
          padding: 8px 0;
          position: relative;
          transition: all 0.3s ease;
        }

        .main-menu ul li a:hover {
          color: #ffd700 !important;
        }

        .main-menu ul li a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #ffd700, #667eea);
          transition: width 0.3s ease;
        }

        .main-menu ul li a:hover::after,
        .main-menu ul li.active a::after {
          width: 100%;
        }

        .main-menu ul li.active a {
          color: #ffd700 !important;
        }

        .header__logo img {
          max-height: 50px;
          filter: brightness(1.2);
        }

        @media (max-width: 1200px) {
          .main-menu ul {
            flex-direction: column !important;
            gap: 1rem !important;
            padding: 20px;
          }

          .main-menu ul li a {
            display: block;
            padding: 12px 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
          }

          .header__account a {
            font-size: 14px !important;
            padding: 10px 18px !important;
          }
        }

        @media (max-width: 768px) {
          .header__account a {
            font-size: 12px !important;
            padding: 8px 14px !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
