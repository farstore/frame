import { useSelector } from "react-redux";
import { State } from "~/store";
import { getAddress } from 'viem';

const prettyPrintAddress = (address: string) => `${address.substr(0, 6)}...${address.substr(-4)}`;

function Username({ address, both }: { address: string, both?: boolean }) {
  const username = useSelector((state: State) => state.user.handle[getAddress(address)]);

  let handleElt = null;
  if (username) {
    handleElt = (
      <span>
        {username}
        <img
          alt="farcaster-logo"
          src="/fc.svg"
          style={{ height: '1em', marginLeft: '.25em', cursor: 'pointer', display: 'inline-block' }}
        />
      </span>
    );
  }
  const addressElt = <span>{prettyPrintAddress(address)}</span>;
  if (both) {
    return <span>{handleElt}<span className="secondary-text">{addressElt}</span></span>
  }  else {
    return handleElt || addressElt;
  }
}

export default Username;
