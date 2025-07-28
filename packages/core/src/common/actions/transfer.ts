export const transfer = ({ amount }: any) => {
  const deposit = BigInt(amount.yoctoNear);

  return {
    transfer: {
      deposit,
    },
  };
};
