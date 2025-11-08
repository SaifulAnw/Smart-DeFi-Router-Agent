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
                <a href="/">
                  <img src="assets/img/logo/logo.svg" alt="Logo" srcSet="" />
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
                    <a href="#roadmap">Roadmap</a>
                  </li>
                  <li className="scrollspy-btn">
                    <a href="#team">Team</a>
                  </li>
                  <li className="scrollspy-btn">
                    <a href="#faq">FAQ</a>
                  </li>
                  <li className="scrollspy-btn">
                    <a
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        ownerModel ? setOwnerModel(false) : setOwnerModel(true)
                      }
                      href="#contact"
                    >
                      Contact
                    </a>
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

              {account ? (
                <div className="header__account">
                  <a
                    onClick={() =>
                      navigator.clipboard.writeText(detail?.address)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {shortenAddress(detail?.address)}:{" "}
                    {detail?.maticBal.slice(0, 6)}
                    {currency}
                  </a>
                </div>
              ) : (
                <div className="header__account">
                  <a
                    onClick={() => connectMetamask()}
                    style={{ cursor: "pointer" }}
                  >
                    Connect Wallet
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
