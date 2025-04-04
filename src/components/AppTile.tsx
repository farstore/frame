import Username from "./Username";
import { getNullAddress } from "~/lib/data";
import { Button } from "~/components/ui/Button";

export default function AppTile({
  iconUrl,
  name,
  owner,
  liquidity,
  openAction,
}: {
  iconUrl: string | null;
  name: string | null;
  owner: string;
  liquidity: number;
  openAction?: React.MouseEventHandler<HTMLButtonElement>;
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
          style={{ borderRadius: '12px' }}
          alt="app-logo"
        />
      </div>
      <div className="flex-grow" style={{ marginLeft: "1em", padding: '.25em 0' }}>
        <div style={{ fontWeight: "bold" }}>{name || (<i>loading</i>)}</div>
        <div style={{ fontSize: ".75em" }}>
          <span>By <Username address={owner || getNullAddress()} /></span>
          {
            liquidity > 0 ? (
              <div>{liquidity.toFixed(2)} ETH in token</div>
            ) : (
              <div>No token</div>
            )
          }
        </div>
      </div>
      {
        openAction && (
          <div className="flex-shrink" style={{ fontSize: '.75em' }}>
            <Button onClick={openAction}>Open</Button>
          </div>
        )
      }
    </div>
  )
}