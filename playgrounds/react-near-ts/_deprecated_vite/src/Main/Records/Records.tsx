import { Button, Group, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { useConnectedAccount, useContractReadFunction } from 'react-near-ts';
import cn from './Records.module.css';
import { useAddRecord } from './useAddRecord.ts';
import { useRemoveRecord } from './useRemoveRecord.ts';

export const Records = () => {
  const [recordInput, setRecordInput] = useState('');
  const { isConnectedAccount } = useConnectedAccount();
  const records = useContractReadFunction({
    contractAccountId: 'react-near-ts.lantstool.testnet',
    functionName: 'get_records',
  });
  const { addRecord } = useAddRecord(setRecordInput);
  const { removeRecord } = useRemoveRecord();

  const submitForm = (event: any) => {
    event.preventDefault();
    addRecord(recordInput);
  };

  if (records.isPending) return <Text>Loading...</Text>;

  if (records.isError) return <Text>Error during calling the get_records method...</Text>;

  return (
    <>
      <Title order={3}>Records</Title>
      <div className={cn.info}>
        {(records.data.result as any).map((record: string, index: number) => (
          <div key={`${record}-${index}`} className={cn.row}>
            <Text>
              #{index + 1}: {record}
            </Text>
            {isConnectedAccount && (
              <Button variant="light" color="red" onClick={() => removeRecord(index)}>
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
      {isConnectedAccount && (
        <div className={cn.addRecord}>
          <form onSubmit={submitForm}>
            <Group align="flex-end" wrap="nowrap">
              <TextInput
                label="Add New Record"
                placeholder="Enter record"
                value={recordInput}
                onChange={(event) => setRecordInput(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Button type="submit" disabled={!recordInput.trim()}>
                Add Record
              </Button>
            </Group>
          </form>
        </div>
      )}
    </>
  );
};
