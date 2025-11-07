export const convertTime = () => {
  const date = new Date(time);
  const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  return formattedDate;
};

export const shortenAddress = (address) =>
  `${address.slice(0, 6)}...${address ? address.slice(-4) : ''}`;
