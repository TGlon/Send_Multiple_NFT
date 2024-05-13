import tonMnemonic from "tonweb-mnemonic";
import TonWeb from "tonweb";

const mnemonic =
  "sound effort chicken detail prison liberty radio intact surprise rely worth elite bone journey sketch save uncle remain switch hello labor item swallow crew"; // 24-word passphrase
const walletVersion = "v4R2"; // v3R2, v4R2, etc.. from tonscan.org
const nftAddresses = [
  "EQCfEbbDhX4ZHsNc_A3FBXDCxYJ2Mdm-2ggPIBwdhQCsL6d4", // comma-separated NFT addresses in ''
  "EQBVC_oXoYvGI2Mg5Cp0gUa7shMpPsVbDFbwJyU9ToX6WUjg",
];
const destinationAddress = "0QCRxHZzINnVQnMzFlnpUdclIxuDIIvFuwSxW8vYeXHkXYNu"; // your new address

(async () => {
  const { NftItem } = TonWeb.token.nft;
  const tonweb = new TonWeb(
    new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC")
  );
  const mnemonicParts = mnemonic.split(" ");
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonicParts);
  const WalletClass = tonweb.wallet.all[walletVersion];
  const wallet = new WalletClass(tonweb.provider, {
    publicKey: keyPair.publicKey,
    wc: 0,
  });
  async function transfer(nftAddress) {
    const myAddress = new TonWeb.utils.Address(destinationAddress);
    const nftItem = new NftItem(tonweb.provider, { address: nftAddress });

    const seqno = (await wallet.methods.seqno().call()) || 0;
    console.log({ seqno });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const amount = TonWeb.utils.toNano(0.04);

    console.log(
      await wallet.methods
        .transfer({
          secretKey: keyPair.secretKey,
          toAddress: await nftAddress,
          amount: amount,
          seqno: seqno,
          payload: await nftItem.createTransferBody({
            newOwnerAddress: myAddress,
            forwardAmount: TonWeb.utils.toNano(0.02),
            forwardPayload: new TextEncoder().encode("gift"),
            responseAddress: myAddress,
          }),
          sendMode: 3,
        })
        .send()
        .catch((e) => console.log(e))
    );
  }

  let i = 0;
  nftAddresses.forEach((e) => {
    setTimeout(() => transfer(e), i * 24000);
    i++;
  });
})();
