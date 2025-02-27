import Username from "./Username";
import { getNullAddress } from "~/lib/data";

export default function AppTile({
  iconUrl,
  name,
  owner
}: {
  iconUrl: string | null;
  name: string | null;
  owner: string;
}) {
  return (
    <div className="flex" style={{ alignItems: "center" }}>
      <div className="flex-shrink" style={{ width: "4em", height: "4em", margin: '0 auto' }}>
        <img
          src={iconUrl || '/fallback-icon.png'}
          style={{ borderRadius: '12px', border: '1px solid #ccc' }}
          alt="app-logo"
        />
      </div>
      <div className="flex-grow" style={{ marginLeft: "1em", padding: '.25em 0' }}>
        <div style={{ fontWeight: "bold" }}>{name || (<i>loading</i>)}</div>
        {
          owner != getNullAddress() &&
          <div style={{ fontSize: ".75em" }}> by <Username address={owner || ''} /> {/*name || (<i>description loading</i>)*/}</div>
        }
      </div>
    </div>
  )
}