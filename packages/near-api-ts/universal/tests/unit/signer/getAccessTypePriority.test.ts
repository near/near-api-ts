import { describe, expect, it } from 'vitest';
import { callContractFunction, transfer } from '../../../index';
import { getAccessTypePriority } from '../../../src/createSigner/createTaskQueue/taskCreators/_common/getAccessTypePriority';

describe('getAccessTypePriority', () => {
  const call = (attachedDeposit?: { yoctoNear: string }) =>
    callContractFunction({ functionName: 'ping', gasLimit: { teraGas: '10' }, attachedDeposit });

  const fullAccessThenContractFunctionCall = [
    { accessType: 'FullAccess' },
    { accessType: 'ContractFunctionCall', contractAccountId: 'abc', calledFnName: 'ping' },
  ];

  it('lets a call without a deposit fall back to an FC key', () => {
    expect(getAccessTypePriority({ receiverAccountId: 'abc', action: call() })).toEqual(
      fullAccessThenContractFunctionCall,
    );
    expect(
      getAccessTypePriority({ receiverAccountId: 'abc', action: call({ yoctoNear: '0' }) }),
    ).toEqual(fullAccessThenContractFunctionCall);
  });

  it('signs a call with a deposit by an FA key only', () => {
    const priority = [{ accessType: 'FullAccess' }];

    expect(
      getAccessTypePriority({ receiverAccountId: 'abc', action: call({ yoctoNear: '1' }) }),
    ).toEqual(priority);
    expect(
      getAccessTypePriority({ receiverAccountId: 'abc', actions: [call({ yoctoNear: '1' })] }),
    ).toEqual(priority);
  });

  it('signs anything but a single call by an FA key only', () => {
    expect(
      getAccessTypePriority({
        receiverAccountId: 'abc',
        actions: [call(), transfer({ amount: { yoctoNear: '1' } })],
      }),
    ).toEqual([{ accessType: 'FullAccess' }]);
  });
});
