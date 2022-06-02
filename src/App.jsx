import React, { useState, useEffect, useCallback } from 'react';
import * as Web3 from 'web3';
import { OpenSeaPort, Network } from 'opensea-js';
import { OrderSide } from 'opensea-js/lib/types'
import { Layout, Menu, Breadcrumb, Typography, Card, notification, Button } from 'antd';

import 'antd/dist/antd.css';
import './App.css';

const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io');

const seaport = new OpenSeaPort(provider, {
  networkName: Network.Rinkeby,
  apiKey: ''
});

const connect = async (onConnected) => {
  if (!window.ethereum) {
    notification.error({
      message: 'Can not auth',
      description: 'Metamask is not found, install it',
    });
  } else {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  
    onConnected(accounts[0]);
  }
};

const checkIfWalletIsConnected = async (onConnected) => {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      onConnected(accounts[0]);
    }
  }
}

const menuItems = [
  { key: 'assets', label: 'Assets' }
];

const App = () => {
  const [assets, setAssets] = useState([]);
  const [userAddress, setUserAddress] = useState('');

  const onAuthClick = useCallback(() => {
    connect(setUserAddress);
  }, []);

  const handleBuyItem = useCallback(async (asset) => {
    try {
      const order = await seaport.api.getOrder({
        side: OrderSide.Sell,
        token_id: asset.tokenId,
        asset_contract_address: asset.assetContract.address,
      });

      const transactionHash = await this.props.seaport.fulfillOrder({ order, userAddress });

      notification.success({
        message: 'Purchase success',
        description: `Transaction hash: ${transactionHash}`,
      });
    } catch (e) {
      notification.error({
        message: 'Purchase fail',
        description: e.message,
      });
    }
  }, [userAddress]);

  useEffect(() => {
    seaport.api.getAssets({ collection: 'garden-pictures' })
      .then(({ assets }) => setAssets(assets));
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected(setUserAddress);
  }, []);

  return (
    <Layout className="main-layout">
      <Layout.Header className="main-layout__header">
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['assets']}
          items={menuItems}
        />
        <div className="main-layout__header-auth">
          {userAddress ? (
            <div className="main-layout__header-auth-tx">{userAddress}</div>
          ) : (
            <Button type="primary" onClick={onAuthClick}>Login</Button>
          )}
          
        </div>
      </Layout.Header>

      <Layout.Content style={{ padding: '0 50px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Assets</Breadcrumb.Item>
        </Breadcrumb>

        <div className="site-layout-content">
          <Typography.Title level={2}>Assets</Typography.Title>

          <div className="assets-outer">
            {assets.map((asset) => (
              <Card
                key={asset.tokenId}
                hoverable
                cover={<img alt="example" src={asset.imageUrl} />}
                actions={[
                  <Button type="primary" onClick={() => handleBuyItem(asset)}>Buy Item</Button>
                ]}
              >
                <Card.Meta title={asset.collection.name} description={asset.description} />
              </Card>
            ))}

            <div className="assets-outer__dummy"></div>
            <div className="assets-outer__dummy"></div>
            <div className="assets-outer__dummy"></div>
            <div className="assets-outer__dummy"></div>
            <div className="assets-outer__dummy"></div>
          </div>
        </div>
      </Layout.Content>

      <Layout.Footer style={{ textAlign: 'center' }}>NFT test market ©2022</Layout.Footer>
    </Layout>
  );
}

export default App;
