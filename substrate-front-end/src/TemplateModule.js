import React, { useEffect, useState } from 'react';
import { Form,Table, Input, Grid, Label, Icon } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main (props) {
  const { api } = useSubstrate();
  const [query, setQuery] = useState('1');
  const [block, setBlock] = useState({hash: null, number: null, stateRoot: null, extrinsicsRoot: null, digest: null});

  const getBlock = api.rpc.chain.getBlock;
  const getBlockHash = api.rpc.chain.getBlockHash;

  const onChange = (_, data) => {
    setQuery(data.value);
  }
  const onSubmit = () => {
    async function fetchData(query) {
      const hash = /^[0-9]+$/.test(query) ? await getBlockHash(query) : query;
      const result = await getBlock(hash); 
      setBlock({hash: result.block.header.hash.toHex(), number: result.block.header.number.toString(), 
               stateRoot: result.block.header.stateRoot.toHex(), extrinsicsRoot: result.block.header.extrinsicsRoot.toHex()
               , digest: result.block.header.digest.toString()
      });
    }

    setBlock({hash: null, number: null, stateRoot: null, extrinsicsRoot: null, digest: null});
    if(query) fetchData(query);
  };



  return (
    <Grid.Column>
      <h1>Block Search</h1>
      <Form style={{overflowX: 'block'}} inline='true' onSubmit={onSubmit}>
        <Form.Field>
         <Form.Group>
          <Input
            fluid
            label='Hash'
            state='query'
            value={query}
            onChange={onChange}
            style={{width: "700px"}}
          />
          <Input type="submit" value="Submit" style={{width: "70px"}}/>
         </Form.Group>
        </Form.Field>
        <Form.Field style={{ textAlign: 'Left'}}>
        
      <Table celled striped size='small'>
        <Table.Body>
          <Table.Row>
            <Table.Cell width={3} textAlign='left'>hash</Table.Cell>
            <Table.Cell width={10}>{block.hash}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell width={3} textAlign='left'>number</Table.Cell>
            <Table.Cell width={10}>{block.number}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell width={3} textAlign='left'>stateRoot</Table.Cell>
            <Table.Cell width={10}>{block.stateRoot}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell width={3} textAlign='left'>extrinsicsRoot</Table.Cell>
            <Table.Cell width={10}>{block.extrinsicsRoot}</Table.Cell>
          </Table.Row>
           <Table.Row>
            <Table.Cell width={3} textAlign='left'>digest</Table.Cell>
            <Table.Cell width={10}>{block.digest}</Table.Cell>
          </Table.Row>
          </Table.Body>
         </Table>
        </Form.Field>
      </Form>
    </Grid.Column>
  );
}

export default function BlockSearcher(props) {
  const { api } = useSubstrate();
  return api.rpc && 
    api.rpc.chain &&
    api.rpc.chain.getBlock &&
    api.rpc.chain.getBlockHash ? (
      <Main {...props} />
    ) : null;
}