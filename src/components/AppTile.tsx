import Username from "./Username";
import { getNullAddress } from "~/lib/data";

export default function AppTile({
  iconUrl,
  name,
  owner,
  symbol,
  liquidity,
  funding,
}: {
  iconUrl: string | null;
  name: string | null;
  owner: string;
  symbol: string;
  liquidity: number;
  funding: number;
}) {
  return (
    <div className="flex ui-island" style={{ alignItems: "center", padding: '.75em' }}>
    <div className="flex flex-shrink"
      style={{
        width: "4em",
        height: "4em",
        margin: '0 auto',
        alignItems: 'center',
        justifyContent: 'center',
        // borderRadius: '12px',
        // border: '1px solid #ccc',
      }}
    >
      <img
        src={iconUrl || '/fallback-icon.png'}
        style={{ borderRadius: '12px', maxHeight: '100%' }}
        alt="app-logo"
      />
    </div>
      <div className="flex-grow" style={{ marginLeft: ".75em", padding: '.25em 0' }}>
        <div style={{ fontWeight: "bold" }}>{name || (<i>loading</i>)}</div>
        <div style={{ fontSize: ".75em" }}>
          <span>by <Username address={owner || getNullAddress()} /></span>
        </div>
      </div>
      {
        liquidity > 0 ? (
          <div className="flex-shrink" style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>{(liquidity || 0).toFixed(2)}Ξ</div>
            <div style={{ fontSize: '.75em' }}>in ${symbol}</div>
          </div>
        ) : (
          <div className="flex-shrink" style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>{(funding || 0).toFixed(2)}Ξ</div>
            <div style={{ fontSize: '.75em' }}>in funding</div>
          </div>
        )
      }
    </div>
  )
}