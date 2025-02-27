"use client";
import Link from 'next/link';
import { ConnectKitButton } from 'connectkit';

export default function Navigation() {
  return (
    <div className="flex p-4" style={{ color: 'black', alignItems: 'center' }}>
      <div className="flex-grow">
        <Link href="/"><img src="/favicon.png" alt="farstore-logo" style={{ width: '2.5em', height: '2.5em' }} /></Link>
      </div>
      <div className="flex-grow" />
      <ConnectKitButton showAvatar={false} />
    </div>
  );
}
