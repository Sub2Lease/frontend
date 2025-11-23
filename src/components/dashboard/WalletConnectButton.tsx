// src/components/dashboard/WalletConnectButton.tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";

const WalletConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div>
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="
                  px-4 py-2 rounded-xl 
                  bg-[#2a2a2a] text-white 
                  border border-white/10 
                  shadow-sm
                  hover:bg-red-600 hover:border-red-600
                  transition-all
                "
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={openAccountModal}
                className="
                  px-4 py-2 rounded-xl 
                  bg-[#2a2a2a] text-white 
                  border border-white/10 
                  shadow-sm
                  hover:bg-red-600 hover:border-red-600
                  transition-all
                "
              >
                {account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnectButton;
