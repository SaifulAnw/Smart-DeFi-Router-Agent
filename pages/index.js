import React, { useState, useEffect, useContext } from "react";
import {
  About,
  Footer,
  Token,
  Brand,
  Header,
  Progress,
  Contact,
  Hero,
  Roadmap,
  TransferToken,
  SideBar,
  Faq,
  Loader,
  Team,
  Features,
  TokenInfo,
  // Model
  Popup,
  TransferCurrency,
  Owner,
  Donate,
  UpdateAddress,
  UpdatePrice,
} from "../Components";
import { convertTime, shortenAddress } from "../Utils/index";
import { TOKEN_ICO_Context } from "../context/index";

import { TOKEN_ADDRESS } from "../context/constants";

const index = () => {
  const {
    TOKEN_ICO,
    BUY_TOKEN,
    TOKEN_WITHDRAW,
    UPDATE_TOKEN,
    UPDATE_TOKEN_PRICE,
    DONATE,
    TRANSFER_ETHER,
    TRANSFER_TOKEN,
    CONNECT_WALLET,
    ERC20,
    CHECK_ACCOUNT_BALANCE,
    setAccount,
    setLoader,
    addTokenToMetamask,
    currency,
    account,
    loader,
    DAPP_NAME,
    network,
  } = useContext(TOKEN_ICO_Context);

  const [ownerModel, setOwnerModel] = useState(false);
  const [buyModel, setBuyModel] = useState(false);
  const [transferModel, setTransferModel] = useState(false);
  const [transferCurrency, setTransferCurrency] = useState(false);
  const [openDonate, setOpenDonate] = useState(false);
  const [openUpdateAddress, setOpenUpdateAddress] = useState(false);
  const [openUpdatePrice, setOpenUpdatePrice] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const items = await TOKEN_ICO();
        console.log("Items:", items);
        if (items) {
          setDetail(items);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    fetchData();
  }, [account]);
  return (
    <>
      <div className="body_wrap">
        {ownerModel && (
          <Owner
            setOwnerModel={setOwnerModel}
            currency={currency}
            detail={detail}
            setTransferModel={setTransferModel}
            setTransferCurrency={setTransferCurrency}
            setOpenDonate={setOpenDonate}
            setOpenUpdateAddress={setOpenUpdateAddress}
            setOpenUpdatePrice={setOpenUpdatePrice}
          />
        )}
        {buyModel && (
          <Popup
            setBuyModel={setBuyModel}
            BUY_TOKEN={BUY_TOKEN}
            currency={currency}
            detail={detail}
            account={account}
            ERC20={ERC20}
            TOKEN_ADDRESS={TOKEN_ADDRESS}
            setLoader={setLoader}
          />
        )}
        {transferModel && (
          <TransferToken
            setTransferModel={setTransferModel}
            TRANSFER_TOKEN={TRANSFER_TOKEN}
            ERC20={ERC20}
            setLoader={setLoader}
          />
        )}
        {transferCurrency && (
          <TransferCurrency
            setTransferCurrency={setTransferCurrency}
            TRANSFER_ETHER={TRANSFER_ETHER}
            detail={detail}
            currency={currency}
            TRANSFER_CURRENCY={transferCurrency}
            CHECK_ACCOUNT_BALANCE={CHECK_ACCOUNT_BALANCE}
            setLoader={setLoader}
          />
        )}
        {openDonate && (
          <Donate
            setOpenDonate={setOpenDonate}
            detail={detail}
            currency={currency}
            setLoader={setLoader}
          />
        )}

        {openUpdatePrice && (
          <UpdatePrice
            detail={detail}
            currency={currency}
            setOpenUpdatePrice={setOpenUpdatePrice}
            UPDATE_TOKEN_PRICE={UPDATE_TOKEN_PRICE}
            setLoader={setLoader}
          />
        )}

        {openUpdateAddress && (
          <UpdateAddress
            detail={detail}
            currency={currency}
            setOpenUpdateAddress={setOpenUpdateAddress}
            UPDATE_TOKEN={UPDATE_TOKEN}
            ERC20={ERC20}
            setLoader={setLoader}
          />
        )}
        {loader && <Loader />}

        <Header
          account={account}
          CONNECT_WALLET={CONNECT_WALLET}
          setAccount={setAccount}
          setLoader={setLoader}
          setOwnerModel={setOwnerModel}
          shortenAddress={shortenAddress}
          detail={detail}
          currency={currency}
          ownerModel={ownerModel}
        />
        <SideBar />
        <Hero
          detail={detail}
          setBuyModel={setBuyModel}
          account={account}
          CONNECT_WALLET={CONNECT_WALLET}
          setAccount={setAccount}
          setLoader={setLoader}
          addTokenToMetamask={addTokenToMetamask}
        />
        <About />
        <Features />
        <Token />
        <TokenInfo detail={detail} />
        <Team />
        <Faq />
        <Contact />
        <Footer />
      </div>
    </>
  );
};

export default index;
