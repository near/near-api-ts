const tx = {
  ok: true,
  value: {
    transactionHash: 'HoWytDmLdYF4MnmayBSArwxef6Tj6pDYjnuNCVdSEnXe',
    processingStage: 'ExecutedFinal',
    executionOutcome: {
      SuccessValue: '',
    },
    signerAccountId: 'intents.near',
    signerPublicKey: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
    nonce: 151978851108390,
    actionSummaries: [],
    receiverAccountId: 'intents.near',
    signature:
      'ed25519:3Rdx1sz4dw19aNeyUuUHzmNHtPWstzPu8cfYZj6tUYtiDnnbf4ZiBUHJ2iaYjxPs3hxS5VgwBxduqNSvWN5zSbj7',
    executionTrace: {
      conversionStep: {
        executionOutcome: {
          status: 'ContinuesIn',
          receiptId: 'z6RxSWKZD7cgpU2sArqTVUQQRLe2mv8z2sJrMHti1uA',
        },
        executedAt: {
          blockHash: 'EZoTP1PLsAwE741tzBkBXgbGK3oiv3stW5LzgHiyqj22',
        },
        gasFee: {
          near: '0.0000311565444512',
          yoctoNear: 31156544451200000000n,
        },
        gasUsed: {
          teraGas: '0.311565444512',
          gas: 311565444512n,
        },
        proof: [
          {
            direction: 'Right',
            hash: 'HoMEXY6UXv7Q44RQRZNDo1ATYAMKQKhJgiaUBYJwR6sT',
          },
          {
            direction: 'Right',
            hash: '5waCAKFNmbfQHnRFPZ9qeGPvH8s513ajWpHDt3EZFspi',
          },
        ],
      },
      executionSteps: [
        {
          receiptId: 'z6RxSWKZD7cgpU2sArqTVUQQRLe2mv8z2sJrMHti1uA',
          creatorAccountId: 'intents.near',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: null,
          dataReceivers: null,
          executorAccountId: 'intents.near',
          executedAt: {
            blockHash: 'EZoTP1PLsAwE741tzBkBXgbGK3oiv3stW5LzgHiyqj22',
          },
          executionOutcome: {
            status: 'Success',
            data: '',
          },
          createdReceiptIds: [
            '93zM3pgLnzdStfNxAEYh8WwtxknbpkF9XGr1mnnQrfjk',
            '4ETSzNP1AzbaKM5VFXbhMrDCiMo7fgffcaTttkqbYWZY',
          ],
          gasFee: {
            near: '0.0010038341571544',
            yoctoNear: 1003834157154400000000n,
          },
          gasUsed: {
            teraGas: '10.038341571544',
            gas: 10038341571544n,
          },
          gasBreakdown: {
            version: 3,
            actionCosts: {
              FunctionCallBase: {
                teraGas: '0.4',
                gas: 400000000000n,
              },
              FunctionCallByte: {
                teraGas: '0.013920825638',
                gas: 13920825638n,
              },
              NewActionReceipt: {
                teraGas: '0.289092464624',
                gas: 289092464624n,
              },
            },
            wasmInstructionCosts: {
              Base: {
                teraGas: '0.027006347322',
                gas: 27006347322n,
              },
              ContractLoadingBase: {
                teraGas: '0.000035445963',
                gas: 35445963n,
              },
              ContractLoadingBytes: {
                teraGas: '1.460427610155',
                gas: 1460427610155n,
              },
              Ed25519VerifyBase: {
                teraGas: '0.42',
                gas: 420000000000n,
              },
              Ed25519VerifyByte: {
                teraGas: '0.000576',
                gas: 576000000n,
              },
              LogBase: {
                teraGas: '0.0212598783',
                gas: 21259878300n,
              },
              LogByte: {
                teraGas: '0.038302891482',
                gas: 38302891482n,
              },
              ReadCachedTrieNode: {
                teraGas: '0.6612',
                gas: 661200000000n,
              },
              ReadMemoryBase: {
                teraGas: '0.2427172776',
                gas: 242717277600n,
              },
              ReadMemoryByte: {
                teraGas: '0.03945783654',
                gas: 39457836540n,
              },
              ReadRegisterBase: {
                teraGas: '0.093135111882',
                gas: 93135111882n,
              },
              ReadRegisterByte: {
                teraGas: '0.000403315704',
                gas: 403315704n,
              },
              Sha256Base: {
                teraGas: '0.108983286',
                gas: 108983286000n,
              },
              Sha256Byte: {
                teraGas: '0.086725994196',
                gas: 86725994196n,
              },
              StorageHasKeyBase: {
                teraGas: '0.486359069625',
                gas: 486359069625n,
              },
              StorageHasKeyByte: {
                teraGas: '0.00886776336',
                gas: 8867763360n,
              },
              StorageReadBase: {
                teraGas: '0.845352686235',
                gas: 845352686235n,
              },
              StorageReadKeyByte: {
                teraGas: '0.016126269693',
                gas: 16126269693n,
              },
              StorageReadValueByte: {
                teraGas: '0.009869756036',
                gas: 9869756036n,
              },
              StorageRemoveBase: {
                teraGas: '0.1604190915',
                gas: 160419091500n,
              },
              StorageRemoveKeyByte: {
                teraGas: '0.005847718752',
                gas: 5847718752n,
              },
              StorageRemoveRetValueByte: {
                teraGas: '0.000438199128',
                gas: 438199128n,
              },
              StorageWriteBase: {
                teraGas: '0.706164096',
                gas: 706164096000n,
              },
              StorageWriteEvictedByte: {
                teraGas: '0.055273885347',
                gas: 55273885347n,
              },
              StorageWriteKeyByte: {
                teraGas: '0.022906931775',
                gas: 22906931775n,
              },
              StorageWriteValueByte: {
                teraGas: '0.055368092115',
                gas: 55368092115n,
              },
              TouchingTrieNode: {
                teraGas: '0.285',
                gas: 285000000000n,
              },
              Utf8DecodingBase: {
                teraGas: '0.024894232488',
                gas: 24894232488n,
              },
              Utf8DecodingByte: {
                teraGas: '0.85433080347',
                gas: 854330803470n,
              },
              WasmInstruction: {
                teraGas: '1.434695584608',
                gas: 1434695584608n,
              },
              WriteMemoryBase: {
                teraGas: '0.106544204718',
                gas: 106544204718n,
              },
              WriteMemoryByte: {
                teraGas: '0.011189255376',
                gas: 11189255376n,
              },
              WriteRegisterBase: {
                teraGas: '0.137545079328',
                gas: 137545079328n,
              },
              WriteRegisterByte: {
                teraGas: '0.016339122072',
                gas: 16339122072n,
              },
            },
          },
          logs: [
            'EVENT_JSON:{"standard":"dip4","version":"0.3.0","event":"token_diff","data":[{"intent_hash":"B6NsFf8v8T8dCc671uxYWaeHcMdRf8DBn2ZXn2Y18aZz","account_id":"solver-priv-liq.near","diff":{"nep141:sol.omft.near":"18999981","nep245:v2_1.omni.hot.tg:56_11111111111111111111":"-2541553358444100"},"fees_collected":{"nep245:v2_1.omni.hot.tg:56_11111111111111111111":"2541553359"}}]}',
            'EVENT_JSON:{"standard":"dip4","version":"0.3.0","event":"token_diff","data":[{"intent_hash":"DaqjLUF4BMwGPWpYgJbrymGzpb8H82spkTjuapdL8JGX","account_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","diff":{"nep141:sol.omft.near":"-19000000","nep245:v2_1.omni.hot.tg:56_11111111111111111111":"2541550816890741"},"referral":"1click-rango","fees_collected":{"nep141:sol.omft.near":"19"}}]}',
            'EVENT_JSON:{"standard":"dip4","version":"0.3.0","event":"mt_withdraw","data":[{"intent_hash":"DaqjLUF4BMwGPWpYgJbrymGzpb8H82spkTjuapdL8JGX","account_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","token":"v2_1.omni.hot.tg","receiver_id":"bridge-refuel.hot.tg","token_ids":["56_11111111111111111111"],"amounts":["2541550816890741"],"msg":"{\\"receiver_id\\":\\"2EXw7ycP6tb4Yyqm6WQxTF1zsLwR\\",\\"amount_native\\":\\"13000000000000\\",\\"block_number\\":95193999}","min_gas":"91300000000000"}]}',
            'EVENT_JSON:{"standard":"dip4","version":"0.3.1","event":"intents_executed","data":[{"intent_hash":"B6NsFf8v8T8dCc671uxYWaeHcMdRf8DBn2ZXn2Y18aZz","account_id":"solver-priv-liq.near","nonce":"qMEK+4Mh5Uy/zuZHenN5ynRu5YVRfb5y8zYjh81HySU="},{"intent_hash":"DaqjLUF4BMwGPWpYgJbrymGzpb8H82spkTjuapdL8JGX","account_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","nonce":"Vij2xgAlKBKzwKm8+8yOqhiwZo4HPEqXeFltoaUpGr4="}]}',
            'EVENT_JSON:{"standard":"nep245","version":"1.0.0","event":"mt_transfer","data":[{"old_owner_id":"solver-priv-liq.near","new_owner_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","token_ids":["nep245:v2_1.omni.hot.tg:56_11111111111111111111"],"amounts":["2541550816890741"]},{"old_owner_id":"solver-priv-liq.near","new_owner_id":"7066024d3f20f94de601c003163367873cca78507eeca4df66d9be645f197f05","token_ids":["nep245:v2_1.omni.hot.tg:56_11111111111111111111"],"amounts":["2541553359"]},{"old_owner_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","new_owner_id":"solver-priv-liq.near","token_ids":["nep141:sol.omft.near"],"amounts":["18999981"]},{"old_owner_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","new_owner_id":"7066024d3f20f94de601c003163367873cca78507eeca4df66d9be645f197f05","token_ids":["nep141:sol.omft.near"],"amounts":["19"]}]}',
            'EVENT_JSON:{"standard":"nep245","version":"1.0.0","event":"mt_burn","data":[{"owner_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","token_ids":["nep245:v2_1.omni.hot.tg:56_11111111111111111111"],"amounts":["2541550816890741"],"memo":"withdraw"}]}',
          ],
          proof: [
            {
              direction: 'Left',
              hash: '5mg7M2wg1msNeKbzgfDxznPjqQdq3G7HQkvDowm8Dsgc',
            },
            {
              direction: 'Right',
              hash: '5waCAKFNmbfQHnRFPZ9qeGPvH8s513ajWpHDt3EZFspi',
            },
          ],
        },
        {
          receiptId: '93zM3pgLnzdStfNxAEYh8WwtxknbpkF9XGr1mnnQrfjk',
          creatorAccountId: 'intents.near',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: null,
          dataReceivers: [
            {
              dataId: 'BpKDsrSsvVgKxjq96horvHvLYHTUH8dBQtc7qHh4BTqR',
              receiverAccountId: 'intents.near',
            },
          ],
          executorAccountId: 'v2_1.omni.hot.tg',
          executedAt: {
            blockHash: 'DLEXfEwrN1zaNtq5KYKm9J1uWXMfZRzzVbZL2EsqReqh',
          },
          executionOutcome: {
            status: 'ContinuesIn',
            receiptId: '9y2toHkV81YubmJjELi1hHdRPZk2vZKr92YJqwRuoLZt',
          },
          createdReceiptIds: [
            '8d7wwm59AiCiNH9neeaXih6RvWqvyZBaMWVpaKyme5Sk',
            '9y2toHkV81YubmJjELi1hHdRPZk2vZKr92YJqwRuoLZt',
          ],
          gasFee: {
            near: '0.000446923056563',
            yoctoNear: 446923056563000000000n,
          },
          gasUsed: {
            teraGas: '4.46923056563',
            gas: 4469230565630n,
          },
          gasBreakdown: {
            version: 3,
            actionCosts: {
              FunctionCallBase: {
                teraGas: '0.4',
                gas: 400000000000n,
              },
              FunctionCallByte: {
                teraGas: '0.013426830117',
                gas: 13426830117n,
              },
              NewActionReceipt: {
                teraGas: '0.289092464624',
                gas: 289092464624n,
              },
              NewDataReceiptByte: {
                teraGas: '0.000259582904',
                gas: 259582904n,
              },
            },
            wasmInstructionCosts: {
              Base: {
                teraGas: '0.014032709883',
                gas: 14032709883n,
              },
              ContractLoadingBase: {
                teraGas: '0.000035445963',
                gas: 35445963n,
              },
              ContractLoadingBytes: {
                teraGas: '0.96788435789',
                gas: 967884357890n,
              },
              LogBase: {
                teraGas: '0.00354331305',
                gas: 3543313050n,
              },
              LogByte: {
                teraGas: '0.002930131602',
                gas: 2930131602n,
              },
              PromiseReturn: {
                teraGas: '0.000560152386',
                gas: 560152386n,
              },
              ReadCachedTrieNode: {
                teraGas: '0.17328',
                gas: 173280000000n,
              },
              ReadMemoryBase: {
                teraGas: '0.104394528',
                gas: 104394528000n,
              },
              ReadMemoryByte: {
                teraGas: '0.006907022061',
                gas: 6907022061n,
              },
              ReadRegisterBase: {
                teraGas: '0.03775747779',
                gas: 37757477790n,
              },
              ReadRegisterByte: {
                teraGas: '0.000081215088',
                gas: 81215088n,
              },
              Sha256Base: {
                teraGas: '0.0272458215',
                gas: 27245821500n,
              },
              Sha256Byte: {
                teraGas: '0.00699403179',
                gas: 6994031790n,
              },
              StorageHasKeyBase: {
                teraGas: '0.270199483125',
                gas: 270199483125n,
              },
              StorageHasKeyByte: {
                teraGas: '0.00424913661',
                gas: 4249136610n,
              },
              StorageReadBase: {
                teraGas: '0.394497920243',
                gas: 394497920243n,
              },
              StorageReadKeyByte: {
                teraGas: '0.004704785016',
                gas: 4704785016n,
              },
              StorageReadValueByte: {
                teraGas: '0.001930185376',
                gas: 1930185376n,
              },
              StorageWriteBase: {
                teraGas: '0.385180416',
                gas: 385180416000n,
              },
              StorageWriteEvictedByte: {
                teraGas: '0.011048353608',
                gas: 11048353608n,
              },
              StorageWriteKeyByte: {
                teraGas: '0.010079049981',
                gas: 10079049981n,
              },
              StorageWriteValueByte: {
                teraGas: '0.010670377416',
                gas: 10670377416n,
              },
              TouchingTrieNode: {
                teraGas: '0.0912',
                gas: 91200000000n,
              },
              Utf8DecodingBase: {
                teraGas: '0.009335337183',
                gas: 9335337183n,
              },
              Utf8DecodingByte: {
                teraGas: '0.075227763582',
                gas: 75227763582n,
              },
              WasmInstruction: {
                teraGas: '0.15301616088',
                gas: 153016160880n,
              },
              WriteMemoryBase: {
                teraGas: '0.044860717776',
                gas: 44860717776n,
              },
              WriteMemoryByte: {
                teraGas: '0.00228796848',
                gas: 2287968480n,
              },
              WriteRegisterBase: {
                teraGas: '0.060175972206',
                gas: 60175972206n,
              },
              WriteRegisterByte: {
                teraGas: '0.003451820112',
                gas: 3451820112n,
              },
            },
          },
          logs: [
            'EVENT_JSON:{"standard":"nep245","version":"1.0.0","event":"mt_transfer","data":[{"old_owner_id":"intents.near","new_owner_id":"bridge-refuel.hot.tg","token_ids":["56_11111111111111111111"],"amounts":["2541550816890741"]}]}',
          ],
          proof: [
            {
              direction: 'Left',
              hash: '6ub4pdK2dRGiEFzPV5wZVN8EvPUbwUB54XWizFWanT72',
            },
          ],
        },
        {
          receiptId: '8d7wwm59AiCiNH9neeaXih6RvWqvyZBaMWVpaKyme5Sk',
          creatorAccountId: 'v2_1.omni.hot.tg',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: null,
          dataReceivers: [
            {
              dataId: 'HYjyyTkVejbGYCCvWaGTKB93AbjLZo5EBUn7GvwbR9Qd',
              receiverAccountId: 'v2_1.omni.hot.tg',
            },
          ],
          executorAccountId: 'bridge-refuel.hot.tg',
          executedAt: {
            blockHash: 'ELSCRvSZoS5bWuhLJN6nvF99Zr9WdfjxoreNqu2PMRjP',
          },
          executionOutcome: {
            status: 'Success',
            data: 'WyIwIl0=',
          },
          createdReceiptIds: [
            '9eXEwiPTv7Tti7F5TM4rdMN6rhwc1J1eYTH7a4YydXP8',
            'Bp38rPVahXfoURfgtAHNKVPqLnbeh79GbWgUw8BuegEL',
          ],
          gasFee: {
            near: '0.0002202172085376',
            yoctoNear: 220217208537600000000n,
          },
          gasUsed: {
            teraGas: '2.202172085376',
            gas: 2202172085376n,
          },
          gasBreakdown: {
            version: 3,
            actionCosts: {
              FunctionCallBase: {
                teraGas: '0.4',
                gas: 400000000000n,
              },
              FunctionCallByte: {
                teraGas: '0.005951617901',
                gas: 5951617901n,
              },
              NewActionReceipt: {
                teraGas: '0.289092464624',
                gas: 289092464624n,
              },
              NewDataReceiptByte: {
                teraGas: '0.00032447863',
                gas: 324478630n,
              },
            },
            wasmInstructionCosts: {
              Base: {
                teraGas: '0.005560130331',
                gas: 5560130331n,
              },
              ContractLoadingBase: {
                teraGas: '0.000035445963',
                gas: 35445963n,
              },
              ContractLoadingBytes: {
                teraGas: '0.26111272586',
                gas: 261112725860n,
              },
              LogBase: {
                teraGas: '0.00354331305',
                gas: 3543313050n,
              },
              LogByte: {
                teraGas: '0.000620343177',
                gas: 620343177n,
              },
              ReadCachedTrieNode: {
                teraGas: '0.00228',
                gas: 2280000000n,
              },
              ReadMemoryBase: {
                teraGas: '0.0339282216',
                gas: 33928221600n,
              },
              ReadMemoryByte: {
                teraGas: '0.001550943864',
                gas: 1550943864n,
              },
              ReadRegisterBase: {
                teraGas: '0.010068660744',
                gas: 10068660744n,
              },
              ReadRegisterByte: {
                teraGas: '0.00003252546',
                gas: 32525460n,
              },
              StorageReadBase: {
                teraGas: '0.056356845749',
                gas: 56356845749n,
              },
              StorageReadKeyByte: {
                teraGas: '0.000154762665',
                gas: 154762665n,
              },
              StorageReadValueByte: {
                teraGas: '0.00019638514',
                gas: 196385140n,
              },
              StorageWriteBase: {
                teraGas: '0.064196736',
                gas: 64196736000n,
              },
              StorageWriteEvictedByte: {
                teraGas: '0.001124105745',
                gas: 1124105745n,
              },
              StorageWriteKeyByte: {
                teraGas: '0.000352414335',
                gas: 352414335n,
              },
              StorageWriteValueByte: {
                teraGas: '0.001085648865',
                gas: 1085648865n,
              },
              TouchingTrieNode: {
                teraGas: '0.05016',
                gas: 50160000000n,
              },
              Utf8DecodingBase: {
                teraGas: '0.009335337183',
                gas: 9335337183n,
              },
              Utf8DecodingByte: {
                teraGas: '0.024201179757',
                gas: 24201179757n,
              },
              WasmInstruction: {
                teraGas: '0.06254591112',
                gas: 62545911120n,
              },
              WriteMemoryBase: {
                teraGas: '0.014018974305',
                gas: 14018974305n,
              },
              WriteMemoryByte: {
                teraGas: '0.000942425112',
                gas: 942425112n,
              },
              WriteRegisterBase: {
                teraGas: '0.01432761243',
                gas: 14327612430n,
              },
              WriteRegisterByte: {
                teraGas: '0.000402965784',
                gas: 402965784n,
              },
            },
          },
          logs: ['prepaid_gas: NearGas { inner: 133359160601713 }'],
          proof: [
            {
              direction: 'Left',
              hash: 'Gar6S85R4eoPwGa2SKJmhnJia3XEJxWHGtYCTAviA73Y',
            },
          ],
        },
        {
          receiptId: '9eXEwiPTv7Tti7F5TM4rdMN6rhwc1J1eYTH7a4YydXP8',
          creatorAccountId: 'bridge-refuel.hot.tg',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: null,
          dataReceivers: [
            {
              dataId: '2kZsTvn8RRwtGdyATWKAvaiSdTBx3gxCgupHEVNmkZF3',
              receiverAccountId: 'bridge-refuel.hot.tg',
            },
          ],
          executorAccountId: 'v2_1.omni.hot.tg',
          executedAt: {
            blockHash: '2qSKdK3cFZ9WtyFTN1i8SXPznsAGoWSyd3qp1KpGGoTN',
          },
          executionOutcome: {
            status: 'Success',
            data: 'IjE3NzczODk4MzYwMDAwMDExNDY4NTAi',
          },
          createdReceiptIds: ['CPGJgaBzqA9nzV4gjeu8iqjH5o872iMNpUPTKQVbwn6N'],
          gasFee: {
            near: '0.0004003061326419',
            yoctoNear: 400306132641900000000n,
          },
          gasUsed: {
            teraGas: '4.003061326419',
            gas: 4003061326419n,
          },
          gasBreakdown: {
            version: 3,
            actionCosts: {
              NewDataReceiptByte: {
                teraGas: '0.001557497424',
                gas: 1557497424n,
              },
            },
            wasmInstructionCosts: {
              Base: {
                teraGas: '0.014297477994',
                gas: 14297477994n,
              },
              ContractLoadingBase: {
                teraGas: '0.000035445963',
                gas: 35445963n,
              },
              ContractLoadingBytes: {
                teraGas: '0.96788435789',
                gas: 967884357890n,
              },
              LogBase: {
                teraGas: '0.00354331305',
                gas: 3543313050n,
              },
              LogByte: {
                teraGas: '0.002850938856',
                gas: 2850938856n,
              },
              ReadCachedTrieNode: {
                teraGas: '0.22116',
                gas: 221160000000n,
              },
              ReadMemoryBase: {
                teraGas: '0.091345212',
                gas: 91345212000n,
              },
              ReadMemoryByte: {
                teraGas: '0.005166011547',
                gas: 5166011547n,
              },
              ReadRegisterBase: {
                teraGas: '0.03775747779',
                gas: 37757477790n,
              },
              ReadRegisterByte: {
                teraGas: '0.000062389746',
                gas: 62389746n,
              },
              Sha256Base: {
                teraGas: '0.018163881',
                gas: 18163881000n,
              },
              Sha256Byte: {
                teraGas: '0.004534061988',
                gas: 4534061988n,
              },
              StorageHasKeyBase: {
                teraGas: '0.162119689875',
                gas: 162119689875n,
              },
              StorageHasKeyByte: {
                teraGas: '0.002740385205',
                gas: 2740385205n,
              },
              StorageReadBase: {
                teraGas: '0.56356845749',
                gas: 563568457490n,
              },
              StorageReadKeyByte: {
                teraGas: '0.00650003193',
                gas: 6500031930n,
              },
              StorageReadValueByte: {
                teraGas: '0.002008739432',
                gas: 2008739432n,
              },
              StorageWriteBase: {
                teraGas: '0.513573888',
                gas: 513573888000n,
              },
              StorageWriteEvictedByte: {
                teraGas: '0.010020599784',
                gas: 10020599784n,
              },
              StorageWriteKeyByte: {
                teraGas: '0.013462227597',
                gas: 13462227597n,
              },
              StorageWriteValueByte: {
                teraGas: '0.013679175699',
                gas: 13679175699n,
              },
              TouchingTrieNode: {
                teraGas: '0.14592',
                gas: 145920000000n,
              },
              Utf8DecodingBase: {
                teraGas: '0.003111779061',
                gas: 3111779061n,
              },
              Utf8DecodingByte: {
                teraGas: '0.062981383464',
                gas: 62981383464n,
              },
              WasmInstruction: {
                teraGas: '0.133850882616',
                gas: 133850882616n,
              },
              WriteMemoryBase: {
                teraGas: '0.044860717776',
                gas: 44860717776n,
              },
              WriteMemoryByte: {
                teraGas: '0.001767728028',
                gas: 1767728028n,
              },
              WriteRegisterBase: {
                teraGas: '0.063041494692',
                gas: 63041494692n,
              },
              WriteRegisterByte: {
                teraGas: '0.003170504376',
                gas: 3170504376n,
              },
            },
          },
          logs: [
            'EVENT_JSON:{"standard":"nep245","version":"1.0.0","event":"mt_burn","data":[{"owner_id":"bridge-refuel.hot.tg","token_ids":["56_11111111111111111111"],"amounts":["2528550816890741"],"memo":"1777389836000001146850"}]}',
          ],
          proof: [
            {
              direction: 'Right',
              hash: 'EJcD2pmKGNoZcFE2TGcdaLRPkhGjZQfCNTh5yt28m2xt',
            },
            {
              direction: 'Right',
              hash: '5gH7weyCjDv46cNSxXxZDLaqn8ESLU9Zhuewqnsv4FF6',
            },
          ],
        },
        {
          receiptId: 'CPGJgaBzqA9nzV4gjeu8iqjH5o872iMNpUPTKQVbwn6N',
          creatorAccountId: 'system',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: null,
          dataReceivers: null,
          executorAccountId: 'intents.near',
          executedAt: {
            blockHash: '4xjeuzuKqr9M1gRPcHzW5hr6zCRm7gh4eURXBvUW3csC',
          },
          executionOutcome: {
            status: 'Success',
            data: '',
          },
          createdReceiptIds: null,
          gasFee: {
            near: '0',
            yoctoNear: 0n,
          },
          gasUsed: {
            teraGas: '0.2231825625',
            gas: 223182562500n,
          },
          gasBreakdown: null,
          logs: null,
          proof: [
            {
              direction: 'Right',
              hash: '7DyKmzNw4ox5oAPtpL4pzZdVpT2z8cD2jz9bQEi41cq5',
            },
            {
              direction: 'Left',
              hash: 'FbhzYSZNCvFHsqxz9Vf18ycbkR85fJCAEfuQE4dGuzgy',
            },
            {
              direction: 'Right',
              hash: 'BatBRVtuvkVbSNNQH3RUC139vZa2VJZKAjQYgipiY5MJ',
            },
          ],
        },
        {
          receiptId: 'Bp38rPVahXfoURfgtAHNKVPqLnbeh79GbWgUw8BuegEL',
          creatorAccountId: 'bridge-refuel.hot.tg',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: ['2kZsTvn8RRwtGdyATWKAvaiSdTBx3gxCgupHEVNmkZF3'],
          dataReceivers: null,
          executorAccountId: 'bridge-refuel.hot.tg',
          executedAt: {
            blockHash: '4xjeuzuKqr9M1gRPcHzW5hr6zCRm7gh4eURXBvUW3csC',
          },
          executionOutcome: {
            status: 'Success',
            data: '',
          },
          createdReceiptIds: ['3FopwNg5SEipqUJ5QLLJ7Mo8VAs6urkbwonBQMCABTaw'],
          gasFee: {
            near: '0.0002213661554147',
            yoctoNear: 221366155414700000000n,
          },
          gasUsed: {
            teraGas: '2.213661554147',
            gas: 2213661554147n,
          },
          gasBreakdown: {
            version: 3,
            wasmInstructionCosts: {
              Base: {
                teraGas: '0.00794304333',
                gas: 7943043330n,
              },
              ContractLoadingBase: {
                teraGas: '0.000035445963',
                gas: 35445963n,
              },
              ContractLoadingBytes: {
                teraGas: '0.26111272586',
                gas: 261112725860n,
              },
              ReadCachedTrieNode: {
                teraGas: '0.17784',
                gas: 177840000000n,
              },
              ReadMemoryBase: {
                teraGas: '0.0417578112',
                gas: 41757811200n,
              },
              ReadMemoryByte: {
                teraGas: '0.001136598567',
                gas: 1136598567n,
              },
              ReadRegisterBase: {
                teraGas: '0.020137321488',
                gas: 20137321488n,
              },
              ReadRegisterByte: {
                teraGas: '0.000026808864',
                gas: 26808864n,
              },
              Sha256Base: {
                teraGas: '0.00454097025',
                gas: 4540970250n,
              },
              Sha256Byte: {
                teraGas: '0.000506464371',
                gas: 506464371n,
              },
              StorageReadBase: {
                teraGas: '0.281784228745',
                gas: 281784228745n,
              },
              StorageReadKeyByte: {
                teraGas: '0.002104772244',
                gas: 2104772244n,
              },
              StorageReadValueByte: {
                teraGas: '0.000403992288',
                gas: 403992288n,
              },
              StorageWriteBase: {
                teraGas: '0.32098368',
                gas: 320983680000n,
              },
              StorageWriteEvictedByte: {
                teraGas: '0.002312446104',
                gas: 2312446104n,
              },
              StorageWriteKeyByte: {
                teraGas: '0.004792834956',
                gas: 4792834956n,
              },
              StorageWriteValueByte: {
                teraGas: '0.004404632538',
                gas: 4404632538n,
              },
              TouchingTrieNode: {
                teraGas: '0.09804',
                gas: 98040000000n,
              },
              WasmInstruction: {
                teraGas: '0.037100536308',
                gas: 37100536308n,
              },
              WriteMemoryBase: {
                teraGas: '0.025234153749',
                gas: 25234153749n,
              },
              WriteMemoryByte: {
                teraGas: '0.000784446336',
                gas: 784446336n,
              },
              WriteRegisterBase: {
                teraGas: '0.031520747346',
                gas: 31520747346n,
              },
              WriteRegisterByte: {
                teraGas: '0.000821137824',
                gas: 821137824n,
              },
            },
          },
          logs: null,
          proof: [
            {
              direction: 'Left',
              hash: 'GiUSgzJD2xt7L1QvBucDMEHgfkVAZ861PcGgd2AsMb6V',
            },
          ],
        },
        {
          receiptId: '3FopwNg5SEipqUJ5QLLJ7Mo8VAs6urkbwonBQMCABTaw',
          creatorAccountId: 'system',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: null,
          dataReceivers: null,
          executorAccountId: 'intents.near',
          executedAt: {
            blockHash: 'G5qxV6F9VHHXvpeUqCKjsmCYEc2MLDfKqrYVKfQtn7Gi',
          },
          executionOutcome: {
            status: 'Success',
            data: '',
          },
          createdReceiptIds: null,
          gasFee: {
            near: '0',
            yoctoNear: 0n,
          },
          gasUsed: {
            teraGas: '0.2231825625',
            gas: 223182562500n,
          },
          gasBreakdown: null,
          logs: null,
          proof: [
            {
              direction: 'Right',
              hash: 'AyNCEcByDqWEJu81evKvHuEUf6Pn12ZHst73W9927Z46',
            },
          ],
        },
        {
          receiptId: '9y2toHkV81YubmJjELi1hHdRPZk2vZKr92YJqwRuoLZt',
          creatorAccountId: 'v2_1.omni.hot.tg',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: ['HYjyyTkVejbGYCCvWaGTKB93AbjLZo5EBUn7GvwbR9Qd'],
          dataReceivers: [
            {
              dataId: 'BpKDsrSsvVgKxjq96horvHvLYHTUH8dBQtc7qHh4BTqR',
              receiverAccountId: 'intents.near',
            },
          ],
          executorAccountId: 'v2_1.omni.hot.tg',
          executedAt: {
            blockHash: '2qSKdK3cFZ9WtyFTN1i8SXPznsAGoWSyd3qp1KpGGoTN',
          },
          executionOutcome: {
            status: 'Success',
            data: 'WyIyNTQxNTUwODE2ODkwNzQxIl0=',
          },
          createdReceiptIds: ['CQFdgD2w9UcRnUBmv895pFc9uqrDE7ZVHnNZYojqoeev'],
          gasFee: {
            near: '0.000209823088793',
            yoctoNear: 209823088793000000000n,
          },
          gasUsed: {
            teraGas: '2.09823088793',
            gas: 2098230887930n,
          },
          gasBreakdown: {
            version: 3,
            actionCosts: {
              NewDataReceiptByte: {
                teraGas: '0.00129791452',
                gas: 1297914520n,
              },
            },
            wasmInstructionCosts: {
              Base: {
                teraGas: '0.004765825998',
                gas: 4765825998n,
              },
              ContractLoadingBase: {
                teraGas: '0.000035445963',
                gas: 35445963n,
              },
              ContractLoadingBytes: {
                teraGas: '0.96788435789',
                gas: 967884357890n,
              },
              ReadMemoryBase: {
                teraGas: '0.0104394528',
                gas: 10439452800n,
              },
              ReadMemoryByte: {
                teraGas: '0.000767869266',
                gas: 767869266n,
              },
              ReadRegisterBase: {
                teraGas: '0.01258582593',
                gas: 12585825930n,
              },
              ReadRegisterByte: {
                teraGas: '0.000036763626',
                gas: 36763626n,
              },
              StorageReadBase: {
                teraGas: '0.056356845749',
                gas: 56356845749n,
              },
              StorageReadKeyByte: {
                teraGas: '0.000154762665',
                gas: 154762665n,
              },
              StorageReadValueByte: {
                teraGas: '0.000965092688',
                gas: 965092688n,
              },
              StorageWriteBase: {
                teraGas: '0.064196736',
                gas: 64196736000n,
              },
              StorageWriteEvictedByte: {
                teraGas: '0.005524176804',
                gas: 5524176804n,
              },
              StorageWriteKeyByte: {
                teraGas: '0.000352414335',
                gas: 352414335n,
              },
              StorageWriteValueByte: {
                teraGas: '0.005335188708',
                gas: 5335188708n,
              },
              WasmInstruction: {
                teraGas: '0.042558699612',
                gas: 42558699612n,
              },
              WriteMemoryBase: {
                teraGas: '0.016822769166',
                gas: 16822769166n,
              },
              WriteMemoryByte: {
                teraGas: '0.001059547308',
                gas: 1059547308n,
              },
              WriteRegisterBase: {
                teraGas: '0.017193134916',
                gas: 17193134916n,
              },
              WriteRegisterByte: {
                teraGas: '0.001429388064',
                gas: 1429388064n,
              },
            },
          },
          logs: null,
          proof: [
            {
              direction: 'Left',
              hash: '8oqdb866PSXmGzV39TLuFWbXZMASP9BdRk4ZQRhj4MW3',
            },
            {
              direction: 'Right',
              hash: '5gH7weyCjDv46cNSxXxZDLaqn8ESLU9Zhuewqnsv4FF6',
            },
          ],
        },
        {
          receiptId: 'CQFdgD2w9UcRnUBmv895pFc9uqrDE7ZVHnNZYojqoeev',
          creatorAccountId: 'system',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: null,
          dataReceivers: null,
          executorAccountId: 'intents.near',
          executedAt: {
            blockHash: '4xjeuzuKqr9M1gRPcHzW5hr6zCRm7gh4eURXBvUW3csC',
          },
          executionOutcome: {
            status: 'Success',
            data: '',
          },
          createdReceiptIds: null,
          gasFee: {
            near: '0',
            yoctoNear: 0n,
          },
          gasUsed: {
            teraGas: '0.2231825625',
            gas: 223182562500n,
          },
          gasBreakdown: null,
          logs: null,
          proof: [
            {
              direction: 'Left',
              hash: 'G7jAYwB2DzbWTAyFbqNTp5ot4E63SMs3RfU7KqFSGN3',
            },
            {
              direction: 'Left',
              hash: 'FbhzYSZNCvFHsqxz9Vf18ycbkR85fJCAEfuQE4dGuzgy',
            },
            {
              direction: 'Right',
              hash: 'BatBRVtuvkVbSNNQH3RUC139vZa2VJZKAjQYgipiY5MJ',
            },
          ],
        },
        {
          receiptId: '4ETSzNP1AzbaKM5VFXbhMrDCiMo7fgffcaTttkqbYWZY',
          creatorAccountId: 'intents.near',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: ['BpKDsrSsvVgKxjq96horvHvLYHTUH8dBQtc7qHh4BTqR'],
          dataReceivers: null,
          executorAccountId: 'intents.near',
          executedAt: {
            blockHash: '4xjeuzuKqr9M1gRPcHzW5hr6zCRm7gh4eURXBvUW3csC',
          },
          executionOutcome: {
            status: 'Success',
            data: 'WyIyNTQxNTUwODE2ODkwNzQxIl0=',
          },
          createdReceiptIds: ['5iiTF4YzjzRoBWkV31V56V2qiLjRF2H3PPKWhzR7zcfL'],
          gasFee: {
            near: '0.000303872893329',
            yoctoNear: 303872893329000000000n,
          },
          gasUsed: {
            teraGas: '3.03872893329',
            gas: 3038728933290n,
          },
          gasBreakdown: {
            version: 3,
            wasmInstructionCosts: {
              Base: {
                teraGas: '0.006619202775',
                gas: 6619202775n,
              },
              ContractLoadingBase: {
                teraGas: '0.000035445963',
                gas: 35445963n,
              },
              ContractLoadingBytes: {
                teraGas: '1.460427610155',
                gas: 1460427610155n,
              },
              ReadCachedTrieNode: {
                teraGas: '0.05244',
                gas: 52440000000n,
              },
              ReadMemoryBase: {
                teraGas: '0.026098632',
                gas: 26098632000n,
              },
              ReadMemoryByte: {
                teraGas: '0.003744313005',
                gas: 3744313005n,
              },
              ReadRegisterBase: {
                teraGas: '0.020137321488',
                gas: 20137321488n,
              },
              ReadRegisterByte: {
                teraGas: '0.00009954762',
                gas: 99547620n,
              },
              Sha256Base: {
                teraGas: '0.0090819405',
                gas: 9081940500n,
              },
              Sha256Byte: {
                teraGas: '0.00361760265',
                gas: 3617602650n,
              },
              StorageHasKeyBase: {
                teraGas: '0.054039896625',
                gas: 54039896625n,
              },
              StorageHasKeyByte: {
                teraGas: '0.00098530704',
                gas: 985307040n,
              },
              StorageReadBase: {
                teraGas: '0.112713691498',
                gas: 112713691498n,
              },
              StorageReadKeyByte: {
                teraGas: '0.001145243721',
                gas: 1145243721n,
              },
              StorageReadValueByte: {
                teraGas: '0.003978201836',
                gas: 3978201836n,
              },
              StorageWriteBase: {
                teraGas: '0.128393472',
                gas: 128393472000n,
              },
              StorageWriteEvictedByte: {
                teraGas: '0.022771170663',
                gas: 22771170663n,
              },
              StorageWriteKeyByte: {
                teraGas: '0.002607866079',
                gas: 2607866079n,
              },
              StorageWriteValueByte: {
                teraGas: '0.021992144151',
                gas: 21992144151n,
              },
              TouchingTrieNode: {
                teraGas: '0.0798',
                gas: 79800000000n,
              },
              WasmInstruction: {
                teraGas: '0.077057681448',
                gas: 77057681448n,
              },
              WriteMemoryBase: {
                teraGas: '0.025234153749',
                gas: 25234153749n,
              },
              WriteMemoryByte: {
                teraGas: '0.002794590072',
                gas: 2794590072n,
              },
              WriteRegisterBase: {
                teraGas: '0.02865522486',
                gas: 28655224860n,
              },
              WriteRegisterByte: {
                teraGas: '0.005725155384',
                gas: 5725155384n,
              },
            },
          },
          logs: null,
          proof: [
            {
              direction: 'Left',
              hash: '3Pa5cNU5WkaGvaB4ZNgRFH1GmKrzGUiJnsPKFoS8BCHq',
            },
          ],
        },
        {
          receiptId: '5iiTF4YzjzRoBWkV31V56V2qiLjRF2H3PPKWhzR7zcfL',
          creatorAccountId: 'system',
          createdAt: {
            blockHash: '',
          },
          actionSummaries: [],
          isPromiseYield: false,
          receivedDataIds: null,
          dataReceivers: null,
          executorAccountId: 'intents.near',
          executedAt: {
            blockHash: 'G5qxV6F9VHHXvpeUqCKjsmCYEc2MLDfKqrYVKfQtn7Gi',
          },
          executionOutcome: {
            status: 'Success',
            data: '',
          },
          createdReceiptIds: null,
          gasFee: {
            near: '0',
            yoctoNear: 0n,
          },
          gasUsed: {
            teraGas: '0.2231825625',
            gas: 223182562500n,
          },
          gasBreakdown: null,
          logs: null,
          proof: [
            {
              direction: 'Left',
              hash: '28aZ14Yb7RJiQFHRb1FhMfePufLjr6E9tjYhSDH13Hup',
            },
          ],
        },
      ],
    },
  },
};
