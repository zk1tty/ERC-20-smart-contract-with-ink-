import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Dropdown, Grid, Card, Statistic } from 'semantic-ui-react';
import QErc20Contract, { gasLimit} from './QErc20Contract';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;
  const qerc20Contract = QErc20Contract(api);
  const [accountSelected, setAccountSelected] = useState('');

   // The transaction submission status
  const [status, setStatus] = useState('');

  // The currently stored value
  const [currentWallet, setCurrentWallet] = useState(0);
  const [currentSupply, setCurrentSupply] = useState(0);
  const [formAmount, setFormAmount] = useState(0); 

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map(account => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: 'user'
  }));

  const getBalanceOf = async (accountAddress) => {
    const erc20balance = await qerc20Contract.query.balanceOf(accountAddress, 0, -1, accountAddress);
    return erc20balance.output.toNumber();
  } 

  const getTotalSupply = async () => {
    const erc20supply = await qerc20Contract.query.totalSupply();
    return erc20supply.output.toNumber();
  } 

  const transfer = () => {
    qerc20Contract.tx.transfer(0, -1, accountSelected, formAmount).signAndSend(accountPair, async (result) => {
        let wallet = await getBalanceOf(accountSelected);
        setCurrentWallet(wallet);
    });
}

  const initialAddress =
    keyringOptions.length > 0 ? keyringOptions[0].value : '';

  useEffect(() => {
    let unsubscribe;
    setAccountSelected(initialAddress);
    api.query.templateModule.something(async newValue => {
      // The storage value is an Option<u32>
      // So we have to check whether it is None first
      // There is also unwrapOr
      let supply = await getTotalSupply() 
      setCurrentSupply(supply);
      let wallet = await getBalanceOf(initialAddress)
      setCurrentWallet(wallet);

    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.templateModule, initialAddress]);


  const onChange = async address => {
    // Update state with new account address
    setAccountSelected(address);
    let wallet = await getBalanceOf(address)
    setCurrentWallet(wallet);
  };

  return (
    <Grid.Column width={8}>
      <h1>QERC20 Transfer</h1>
      <Grid centered columns={2} style={{ marginBottom: '11px' }}>
      <Grid.Column>
      <Card centered>
        <Card.Content textAlign='center'>
          <Statistic
            style={{ fontSize: '13px' }}
            label='Total Supply'
            value={currentSupply}
          />
        </Card.Content>
      </Card>
      </Grid.Column>
      <Grid.Column>
      <Card centered>
        <Card.Content textAlign='center'>
          <Statistic
            style={{ fontSize: '13px' }}
            label='Total your Wallet'
            value={currentWallet}
          />
        </Card.Content>
      </Card>
      </Grid.Column>
      </Grid>
      <Form>
        <Form.Field>
            <Dropdown
                search
                selection
                clearable
                placeholder='Select an account'
                options={keyringOptions}
                onChange={(_, dropdown) => {
                onChange(dropdown.value);
                }}
                value={accountSelected}
            />
        </Form.Field>
        <Form.Field>
          <Input
            label='Amount'
            state='formAmount'
            type='number'
            onChange={(_, { value }) => setFormAmount(value)}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
            <Button onClick={transfer}>Transfer</Button>
        </Form.Field> 
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function TemplateModule (props) {
  const { api } = useSubstrate();
  return (api.query.templateModule && api.query.templateModule.something
    ? <Main {...props} /> : null);
}
