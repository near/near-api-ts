import { Button } from '@mantine/core';
import { useState } from 'react';
import { ConnectedAccount } from './ConnectedAccount/ConnectedAccount.tsx';
import cn from './Main.module.css';
import { Records } from './Records/Records.tsx';
import { SendNearTokens } from './SendNearTokens/SendNearTokens.tsx';

const NavButton = ({ title, value, setActiveTab, activeTab }: any) => {
  const isActive = activeTab === value;
  return (
    <Button
      color="blue"
      variant={isActive ? 'outline' : 'subtle'}
      fullWidth
      radius={8}
      onClick={() => setActiveTab(value)}
    >
      {title}
    </Button>
  );
};

export const Main = () => {
  const [activeTab, setActiveTab] = useState('connected-account');

  return (
    <div className={cn.main}>
      <div className={cn.navbar}>
        <NavButton
          title="Connected Account"
          value="connected-account"
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
        <NavButton
          title="Send Near"
          value="send-near"
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
        <NavButton
          title="Records"
          value="records"
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
      </div>
      <div className={cn.content}>
        {activeTab === 'connected-account' && <ConnectedAccount />}
        {activeTab === 'send-near' && <SendNearTokens />}
        {activeTab === 'records' && <Records />}
      </div>
    </div>
  );
};
