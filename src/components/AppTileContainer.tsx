import Link from 'next/link';
import { useSelector } from "react-redux";

import { State } from "~/store";

import AppTile from "./AppTile";

export default function AppTileContainer({
  domain,
}: {
  domain: string;
}) {

  const frame = useSelector((state: State) => state.app.frames[domain]);
  const owner = useSelector((state: State) => state.app.owners[domain]);
  const symbol = useSelector((state: State) => state.app.symbols[domain]);
  const liquidity = useSelector((state: State) => state.app.liquidity[domain]);
  const funding = useSelector((state: State) => state.app.funding[domain]);

  if (!frame) {
    return null;
  }

  return (
    <Link
      href={`/${domain}`}
      style={{ cursor: 'pointer', textDecoration: 'none' }}
    >
      <AppTile
        name={frame.name}
        iconUrl={frame.iconUrl}
        owner={owner}
        symbol={symbol}
        liquidity={liquidity}
        funding={funding}
      />
    </Link>
  );
}