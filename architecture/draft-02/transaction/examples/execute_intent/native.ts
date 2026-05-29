const res = {
  final_execution_status: 'FINAL',
  receipts: [
    {
      predecessor_id: 'intents.near',
      priority: 0,
      receipt: {
        Action: {
          actions: [
            {
              FunctionCall: {
                args: 'eyJyZWNlaXZlcl9pZCI6ImJyaWRnZS1yZWZ1ZWwuaG90LnRnIiwidG9rZW5faWRzIjpbIjU2XzExMTExMTExMTExMTExMTExMTExIl0sImFtb3VudHMiOlsiMjU0MTU1MDgxNjg5MDc0MSJdLCJhcHByb3ZhbHMiOm51bGwsIm1lbW8iOm51bGwsIm1zZyI6IntcInJlY2VpdmVyX2lkXCI6XCIyRVh3N3ljUDZ0YjRZeXFtNldReFRGMXpzTHdSXCIsXCJhbW91bnRfbmF0aXZlXCI6XCIxMzAwMDAwMDAwMDAwMFwiLFwiYmxvY2tfbnVtYmVyXCI6OTUxOTM5OTl9In0=',
                deposit: '1',
                gas: 279076000321572,
                method_name: 'mt_batch_transfer_call',
              },
            },
          ],
          gas_price: '100000000',
          input_data_ids: [],
          is_promise_yield: false,
          output_data_receivers: [
            {
              data_id: 'BpKDsrSsvVgKxjq96horvHvLYHTUH8dBQtc7qHh4BTqR',
              receiver_id: 'intents.near',
            },
          ],
          signer_id: 'intents.near',
          signer_public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
        },
      },
      receipt_id: '93zM3pgLnzdStfNxAEYh8WwtxknbpkF9XGr1mnnQrfjk',
      receiver_id: 'v2_1.omni.hot.tg',
    },
    {
      predecessor_id: 'v2_1.omni.hot.tg',
      priority: 0,
      receipt: {
        Action: {
          actions: [
            {
              FunctionCall: {
                args: 'eyJzZW5kZXJfaWQiOiJpbnRlbnRzLm5lYXIiLCJwcmV2aW91c19vd25lcl9pZHMiOlsiaW50ZW50cy5uZWFyIl0sInRva2VuX2lkcyI6WyI1Nl8xMTExMTExMTExMTExMTExMTExMSJdLCJhbW91bnRzIjpbIjI1NDE1NTA4MTY4OTA3NDEiXSwibXNnIjoie1wicmVjZWl2ZXJfaWRcIjpcIjJFWHc3eWNQNnRiNFl5cW02V1F4VEYxenNMd1JcIixcImFtb3VudF9uYXRpdmVcIjpcIjEzMDAwMDAwMDAwMDAwXCIsXCJibG9ja19udW1iZXJcIjo5NTE5Mzk5OX0ifQ==',
                deposit: '0',
                gas: 133359160601713,
                method_name: 'mt_on_transfer',
              },
            },
          ],
          gas_price: '100000000',
          input_data_ids: [],
          is_promise_yield: false,
          output_data_receivers: [
            {
              data_id: 'HYjyyTkVejbGYCCvWaGTKB93AbjLZo5EBUn7GvwbR9Qd',
              receiver_id: 'v2_1.omni.hot.tg',
            },
          ],
          signer_id: 'intents.near',
          signer_public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
        },
      },
      receipt_id: '8d7wwm59AiCiNH9neeaXih6RvWqvyZBaMWVpaKyme5Sk',
      receiver_id: 'bridge-refuel.hot.tg',
    },
    {
      predecessor_id: 'bridge-refuel.hot.tg',
      priority: 0,
      receipt: {
        Action: {
          actions: [
            {
              FunctionCall: {
                args: 'eyJhbW91bnQiOiIyNTI4NTUwODE2ODkwNzQxIiwicmVjZWl2ZXJfaWQiOiIyRVh3N3ljUDZ0YjRZeXFtNldReFRGMXpzTHdSIiwidG9rZW5faWQiOiI1Nl8xMTExMTExMTExMTExMTExMTExMSJ9',
                deposit: '1',
                gas: 7000000000000,
                method_name: 'withdraw',
              },
            },
          ],
          gas_price: '100000000',
          input_data_ids: [],
          is_promise_yield: false,
          output_data_receivers: [
            {
              data_id: '2kZsTvn8RRwtGdyATWKAvaiSdTBx3gxCgupHEVNmkZF3',
              receiver_id: 'bridge-refuel.hot.tg',
            },
          ],
          signer_id: 'intents.near',
          signer_public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
        },
      },
      receipt_id: '9eXEwiPTv7Tti7F5TM4rdMN6rhwc1J1eYTH7a4YydXP8',
      receiver_id: 'v2_1.omni.hot.tg',
    },
    {
      predecessor_id: 'system',
      priority: 0,
      receipt: {
        Action: {
          actions: [
            {
              Transfer: {
                deposit: '388526424972700000000',
              },
            },
          ],
          gas_price: '0',
          input_data_ids: [],
          is_promise_yield: false,
          output_data_receivers: [],
          signer_id: 'intents.near',
          signer_public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
        },
      },
      receipt_id: 'CPGJgaBzqA9nzV4gjeu8iqjH5o872iMNpUPTKQVbwn6N',
      receiver_id: 'intents.near',
    },
    {
      predecessor_id: 'bridge-refuel.hot.tg',
      priority: 0,
      receipt: {
        Action: {
          actions: [
            {
              FunctionCall: {
                args: 'eyJuYXRpdmVfdG9rZW4iOiI1Nl8xMTExMTExMTExMTExMTExMTExMSIsImFtb3VudCI6MTMwMDAwMDAwMDAwMDAsImNoYWluX2lkIjo1NiwiYmxvY2tfbnVtYmVyIjo5NTE5Mzk5OX0=',
                deposit: '0',
                gas: 123268996094357,
                method_name: 'on_withdraw_complete',
              },
            },
          ],
          gas_price: '100000000',
          input_data_ids: ['2kZsTvn8RRwtGdyATWKAvaiSdTBx3gxCgupHEVNmkZF3'],
          is_promise_yield: false,
          output_data_receivers: [],
          signer_id: 'intents.near',
          signer_public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
        },
      },
      receipt_id: 'Bp38rPVahXfoURfgtAHNKVPqLnbeh79GbWgUw8BuegEL',
      receiver_id: 'bridge-refuel.hot.tg',
    },
    {
      predecessor_id: 'system',
      priority: 0,
      receipt: {
        Action: {
          actions: [
            {
              Transfer: {
                deposit: '12194367129602600000000',
              },
            },
          ],
          gas_price: '0',
          input_data_ids: [],
          is_promise_yield: false,
          output_data_receivers: [],
          signer_id: 'intents.near',
          signer_public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
        },
      },
      receipt_id: '3FopwNg5SEipqUJ5QLLJ7Mo8VAs6urkbwonBQMCABTaw',
      receiver_id: 'intents.near',
    },
    {
      predecessor_id: 'v2_1.omni.hot.tg',
      priority: 0,
      receipt: {
        Action: {
          actions: [
            {
              FunctionCall: {
                args: 'eyJwcmV2aW91c19vd25lcl9pZHMiOlsiaW50ZW50cy5uZWFyIl0sInJlY2VpdmVyX2lkIjoiYnJpZGdlLXJlZnVlbC5ob3QudGciLCJ0b2tlbl9pZHMiOlsiNTZfMTExMTExMTExMTExMTExMTExMTEiXSwiYW1vdW50cyI6WyIyNTQxNTUwODE2ODkwNzQxIl0sImFwcHJvdmFscyI6bnVsbH0=',
                deposit: '0',
                gas: 140359160601713,
                method_name: 'mt_resolve_transfer',
              },
            },
          ],
          gas_price: '100000000',
          input_data_ids: ['HYjyyTkVejbGYCCvWaGTKB93AbjLZo5EBUn7GvwbR9Qd'],
          is_promise_yield: false,
          output_data_receivers: [
            {
              data_id: 'BpKDsrSsvVgKxjq96horvHvLYHTUH8dBQtc7qHh4BTqR',
              receiver_id: 'intents.near',
            },
          ],
          signer_id: 'intents.near',
          signer_public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
        },
      },
      receipt_id: '9y2toHkV81YubmJjELi1hHdRPZk2vZKr92YJqwRuoLZt',
      receiver_id: 'v2_1.omni.hot.tg',
    },
    {
      predecessor_id: 'system',
      priority: 0,
      receipt: {
        Action: {
          actions: [
            {
              Transfer: {
                deposit: '13914939838970500000000',
              },
            },
          ],
          gas_price: '0',
          input_data_ids: [],
          is_promise_yield: false,
          output_data_receivers: [],
          signer_id: 'intents.near',
          signer_public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
        },
      },
      receipt_id: 'CQFdgD2w9UcRnUBmv895pFc9uqrDE7ZVHnNZYojqoeev',
      receiver_id: 'intents.near',
    },
    {
      predecessor_id: 'intents.near',
      priority: 0,
      receipt: {
        Action: {
          actions: [
            {
              FunctionCall: {
                args: 'eyJ0b2tlbiI6InYyXzEub21uaS5ob3QudGciLCJzZW5kZXJfaWQiOiI2OTMwNzAwNTYyOWRlYmJkMzYwZjVhNTY3ZmUxNTFhOTZkM2Q2NzA4MmJmYmUxNzUyNzNmZjc4NGUwOTQ5MjdmIiwidG9rZW5faWRzIjpbIjU2XzExMTExMTExMTExMTExMTExMTExIl0sImFtb3VudHMiOlsiMjU0MTU1MDgxNjg5MDc0MSJdLCJpc19jYWxsIjp0cnVlfQ==',
                deposit: '0',
                gas: 10000000000000,
                method_name: 'mt_resolve_withdraw',
              },
            },
          ],
          gas_price: '100000000',
          input_data_ids: ['BpKDsrSsvVgKxjq96horvHvLYHTUH8dBQtc7qHh4BTqR'],
          is_promise_yield: false,
          output_data_receivers: [],
          signer_id: 'intents.near',
          signer_public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
        },
      },
      receipt_id: '4ETSzNP1AzbaKM5VFXbhMrDCiMo7fgffcaTttkqbYWZY',
      receiver_id: 'intents.near',
    },
    {
      predecessor_id: 'system',
      priority: 0,
      receipt: {
        Action: {
          actions: [
            {
              Transfer: {
                deposit: '784980458471800000000',
              },
            },
          ],
          gas_price: '0',
          input_data_ids: [],
          is_promise_yield: false,
          output_data_receivers: [],
          signer_id: 'intents.near',
          signer_public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
        },
      },
      receipt_id: '5iiTF4YzjzRoBWkV31V56V2qiLjRF2H3PPKWhzR7zcfL',
      receiver_id: 'intents.near',
    },
  ],
  receipts_outcome: [
    {
      block_hash: 'EZoTP1PLsAwE741tzBkBXgbGK3oiv3stW5LzgHiyqj22',
      id: 'z6RxSWKZD7cgpU2sArqTVUQQRLe2mv8z2sJrMHti1uA',
      outcome: {
        executor_id: 'intents.near',
        gas_burnt: 10038341571544,
        logs: [
          'EVENT_JSON:{"standard":"dip4","version":"0.3.0","event":"token_diff","data":[{"intent_hash":"B6NsFf8v8T8dCc671uxYWaeHcMdRf8DBn2ZXn2Y18aZz","account_id":"solver-priv-liq.near","diff":{"nep141:sol.omft.near":"18999981","nep245:v2_1.omni.hot.tg:56_11111111111111111111":"-2541553358444100"},"fees_collected":{"nep245:v2_1.omni.hot.tg:56_11111111111111111111":"2541553359"}}]}',
          'EVENT_JSON:{"standard":"dip4","version":"0.3.0","event":"token_diff","data":[{"intent_hash":"DaqjLUF4BMwGPWpYgJbrymGzpb8H82spkTjuapdL8JGX","account_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","diff":{"nep141:sol.omft.near":"-19000000","nep245:v2_1.omni.hot.tg:56_11111111111111111111":"2541550816890741"},"referral":"1click-rango","fees_collected":{"nep141:sol.omft.near":"19"}}]}',
          'EVENT_JSON:{"standard":"dip4","version":"0.3.0","event":"mt_withdraw","data":[{"intent_hash":"DaqjLUF4BMwGPWpYgJbrymGzpb8H82spkTjuapdL8JGX","account_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","token":"v2_1.omni.hot.tg","receiver_id":"bridge-refuel.hot.tg","token_ids":["56_11111111111111111111"],"amounts":["2541550816890741"],"msg":"{\\"receiver_id\\":\\"2EXw7ycP6tb4Yyqm6WQxTF1zsLwR\\",\\"amount_native\\":\\"13000000000000\\",\\"block_number\\":95193999}","min_gas":"91300000000000"}]}',
          'EVENT_JSON:{"standard":"dip4","version":"0.3.1","event":"intents_executed","data":[{"intent_hash":"B6NsFf8v8T8dCc671uxYWaeHcMdRf8DBn2ZXn2Y18aZz","account_id":"solver-priv-liq.near","nonce":"qMEK+4Mh5Uy/zuZHenN5ynRu5YVRfb5y8zYjh81HySU="},{"intent_hash":"DaqjLUF4BMwGPWpYgJbrymGzpb8H82spkTjuapdL8JGX","account_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","nonce":"Vij2xgAlKBKzwKm8+8yOqhiwZo4HPEqXeFltoaUpGr4="}]}',
          'EVENT_JSON:{"standard":"nep245","version":"1.0.0","event":"mt_transfer","data":[{"old_owner_id":"solver-priv-liq.near","new_owner_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","token_ids":["nep245:v2_1.omni.hot.tg:56_11111111111111111111"],"amounts":["2541550816890741"]},{"old_owner_id":"solver-priv-liq.near","new_owner_id":"7066024d3f20f94de601c003163367873cca78507eeca4df66d9be645f197f05","token_ids":["nep245:v2_1.omni.hot.tg:56_11111111111111111111"],"amounts":["2541553359"]},{"old_owner_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","new_owner_id":"solver-priv-liq.near","token_ids":["nep141:sol.omft.near"],"amounts":["18999981"]},{"old_owner_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","new_owner_id":"7066024d3f20f94de601c003163367873cca78507eeca4df66d9be645f197f05","token_ids":["nep141:sol.omft.near"],"amounts":["19"]}]}',
          'EVENT_JSON:{"standard":"nep245","version":"1.0.0","event":"mt_burn","data":[{"owner_id":"69307005629debbd360f5a567fe151a96d3d67082bfbe175273ff784e094927f","token_ids":["nep245:v2_1.omni.hot.tg:56_11111111111111111111"],"amounts":["2541550816890741"],"memo":"withdraw"}]}',
        ],
        metadata: {
          gas_profile: [
            {
              cost: 'FUNCTION_CALL_BASE',
              cost_category: 'ACTION_COST',
              gas_used: '400000000000',
            },
            {
              cost: 'FUNCTION_CALL_BYTE',
              cost_category: 'ACTION_COST',
              gas_used: '13920825638',
            },
            {
              cost: 'NEW_ACTION_RECEIPT',
              cost_category: 'ACTION_COST',
              gas_used: '289092464624',
            },
            {
              cost: 'BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '27006347322',
            },
            {
              cost: 'CONTRACT_LOADING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '35445963',
            },
            {
              cost: 'CONTRACT_LOADING_BYTES',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1460427610155',
            },
            {
              cost: 'ED25519_VERIFY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '420000000000',
            },
            {
              cost: 'ED25519_VERIFY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '576000000',
            },
            {
              cost: 'LOG_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '21259878300',
            },
            {
              cost: 'LOG_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '38302891482',
            },
            {
              cost: 'READ_CACHED_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '661200000000',
            },
            {
              cost: 'READ_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '242717277600',
            },
            {
              cost: 'READ_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '39457836540',
            },
            {
              cost: 'READ_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '93135111882',
            },
            {
              cost: 'READ_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '403315704',
            },
            {
              cost: 'SHA256_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '108983286000',
            },
            {
              cost: 'SHA256_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '86725994196',
            },
            {
              cost: 'STORAGE_HAS_KEY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '486359069625',
            },
            {
              cost: 'STORAGE_HAS_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '8867763360',
            },
            {
              cost: 'STORAGE_READ_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '845352686235',
            },
            {
              cost: 'STORAGE_READ_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '16126269693',
            },
            {
              cost: 'STORAGE_READ_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '9869756036',
            },
            {
              cost: 'STORAGE_REMOVE_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '160419091500',
            },
            {
              cost: 'STORAGE_REMOVE_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '5847718752',
            },
            {
              cost: 'STORAGE_REMOVE_RET_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '438199128',
            },
            {
              cost: 'STORAGE_WRITE_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '706164096000',
            },
            {
              cost: 'STORAGE_WRITE_EVICTED_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '55273885347',
            },
            {
              cost: 'STORAGE_WRITE_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '22906931775',
            },
            {
              cost: 'STORAGE_WRITE_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '55368092115',
            },
            {
              cost: 'TOUCHING_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '285000000000',
            },
            {
              cost: 'UTF8_DECODING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '24894232488',
            },
            {
              cost: 'UTF8_DECODING_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '854330803470',
            },
            {
              cost: 'WASM_INSTRUCTION',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1434695584608',
            },
            {
              cost: 'WRITE_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '106544204718',
            },
            {
              cost: 'WRITE_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '11189255376',
            },
            {
              cost: 'WRITE_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '137545079328',
            },
            {
              cost: 'WRITE_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '16339122072',
            },
          ],
          version: 3,
        },
        receipt_ids: [
          '93zM3pgLnzdStfNxAEYh8WwtxknbpkF9XGr1mnnQrfjk',
          '4ETSzNP1AzbaKM5VFXbhMrDCiMo7fgffcaTttkqbYWZY',
        ],
        status: {
          SuccessValue: '',
        },
        tokens_burnt: '1003834157154400000000',
      },
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
      block_hash: 'DLEXfEwrN1zaNtq5KYKm9J1uWXMfZRzzVbZL2EsqReqh',
      id: '93zM3pgLnzdStfNxAEYh8WwtxknbpkF9XGr1mnnQrfjk',
      outcome: {
        executor_id: 'v2_1.omni.hot.tg',
        gas_burnt: 4469230565630,
        logs: [
          'EVENT_JSON:{"standard":"nep245","version":"1.0.0","event":"mt_transfer","data":[{"old_owner_id":"intents.near","new_owner_id":"bridge-refuel.hot.tg","token_ids":["56_11111111111111111111"],"amounts":["2541550816890741"]}]}',
        ],
        metadata: {
          gas_profile: [
            {
              cost: 'FUNCTION_CALL_BASE',
              cost_category: 'ACTION_COST',
              gas_used: '400000000000',
            },
            {
              cost: 'FUNCTION_CALL_BYTE',
              cost_category: 'ACTION_COST',
              gas_used: '13426830117',
            },
            {
              cost: 'NEW_ACTION_RECEIPT',
              cost_category: 'ACTION_COST',
              gas_used: '289092464624',
            },
            {
              cost: 'NEW_DATA_RECEIPT_BYTE',
              cost_category: 'ACTION_COST',
              gas_used: '259582904',
            },
            {
              cost: 'BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '14032709883',
            },
            {
              cost: 'CONTRACT_LOADING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '35445963',
            },
            {
              cost: 'CONTRACT_LOADING_BYTES',
              cost_category: 'WASM_HOST_COST',
              gas_used: '967884357890',
            },
            {
              cost: 'LOG_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '3543313050',
            },
            {
              cost: 'LOG_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '2930131602',
            },
            {
              cost: 'PROMISE_RETURN',
              cost_category: 'WASM_HOST_COST',
              gas_used: '560152386',
            },
            {
              cost: 'READ_CACHED_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '173280000000',
            },
            {
              cost: 'READ_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '104394528000',
            },
            {
              cost: 'READ_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '6907022061',
            },
            {
              cost: 'READ_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '37757477790',
            },
            {
              cost: 'READ_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '81215088',
            },
            {
              cost: 'SHA256_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '27245821500',
            },
            {
              cost: 'SHA256_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '6994031790',
            },
            {
              cost: 'STORAGE_HAS_KEY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '270199483125',
            },
            {
              cost: 'STORAGE_HAS_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '4249136610',
            },
            {
              cost: 'STORAGE_READ_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '394497920243',
            },
            {
              cost: 'STORAGE_READ_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '4704785016',
            },
            {
              cost: 'STORAGE_READ_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1930185376',
            },
            {
              cost: 'STORAGE_WRITE_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '385180416000',
            },
            {
              cost: 'STORAGE_WRITE_EVICTED_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '11048353608',
            },
            {
              cost: 'STORAGE_WRITE_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '10079049981',
            },
            {
              cost: 'STORAGE_WRITE_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '10670377416',
            },
            {
              cost: 'TOUCHING_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '91200000000',
            },
            {
              cost: 'UTF8_DECODING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '9335337183',
            },
            {
              cost: 'UTF8_DECODING_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '75227763582',
            },
            {
              cost: 'WASM_INSTRUCTION',
              cost_category: 'WASM_HOST_COST',
              gas_used: '153016160880',
            },
            {
              cost: 'WRITE_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '44860717776',
            },
            {
              cost: 'WRITE_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '2287968480',
            },
            {
              cost: 'WRITE_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '60175972206',
            },
            {
              cost: 'WRITE_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '3451820112',
            },
          ],
          version: 3,
        },
        receipt_ids: [
          '8d7wwm59AiCiNH9neeaXih6RvWqvyZBaMWVpaKyme5Sk',
          '9y2toHkV81YubmJjELi1hHdRPZk2vZKr92YJqwRuoLZt',
        ],
        status: {
          SuccessReceiptId: '9y2toHkV81YubmJjELi1hHdRPZk2vZKr92YJqwRuoLZt',
        },
        tokens_burnt: '446923056563000000000',
      },
      proof: [
        {
          direction: 'Left',
          hash: '6ub4pdK2dRGiEFzPV5wZVN8EvPUbwUB54XWizFWanT72',
        },
      ],
    },
    {
      block_hash: 'ELSCRvSZoS5bWuhLJN6nvF99Zr9WdfjxoreNqu2PMRjP',
      id: '8d7wwm59AiCiNH9neeaXih6RvWqvyZBaMWVpaKyme5Sk',
      outcome: {
        executor_id: 'bridge-refuel.hot.tg',
        gas_burnt: 2202172085376,
        logs: ['prepaid_gas: NearGas { inner: 133359160601713 }'],
        metadata: {
          gas_profile: [
            {
              cost: 'FUNCTION_CALL_BASE',
              cost_category: 'ACTION_COST',
              gas_used: '400000000000',
            },
            {
              cost: 'FUNCTION_CALL_BYTE',
              cost_category: 'ACTION_COST',
              gas_used: '5951617901',
            },
            {
              cost: 'NEW_ACTION_RECEIPT',
              cost_category: 'ACTION_COST',
              gas_used: '289092464624',
            },
            {
              cost: 'NEW_DATA_RECEIPT_BYTE',
              cost_category: 'ACTION_COST',
              gas_used: '324478630',
            },
            {
              cost: 'BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '5560130331',
            },
            {
              cost: 'CONTRACT_LOADING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '35445963',
            },
            {
              cost: 'CONTRACT_LOADING_BYTES',
              cost_category: 'WASM_HOST_COST',
              gas_used: '261112725860',
            },
            {
              cost: 'LOG_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '3543313050',
            },
            {
              cost: 'LOG_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '620343177',
            },
            {
              cost: 'READ_CACHED_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '2280000000',
            },
            {
              cost: 'READ_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '33928221600',
            },
            {
              cost: 'READ_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1550943864',
            },
            {
              cost: 'READ_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '10068660744',
            },
            {
              cost: 'READ_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '32525460',
            },
            {
              cost: 'STORAGE_READ_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '56356845749',
            },
            {
              cost: 'STORAGE_READ_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '154762665',
            },
            {
              cost: 'STORAGE_READ_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '196385140',
            },
            {
              cost: 'STORAGE_WRITE_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '64196736000',
            },
            {
              cost: 'STORAGE_WRITE_EVICTED_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1124105745',
            },
            {
              cost: 'STORAGE_WRITE_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '352414335',
            },
            {
              cost: 'STORAGE_WRITE_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1085648865',
            },
            {
              cost: 'TOUCHING_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '50160000000',
            },
            {
              cost: 'UTF8_DECODING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '9335337183',
            },
            {
              cost: 'UTF8_DECODING_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '24201179757',
            },
            {
              cost: 'WASM_INSTRUCTION',
              cost_category: 'WASM_HOST_COST',
              gas_used: '62545911120',
            },
            {
              cost: 'WRITE_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '14018974305',
            },
            {
              cost: 'WRITE_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '942425112',
            },
            {
              cost: 'WRITE_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '14327612430',
            },
            {
              cost: 'WRITE_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '402965784',
            },
          ],
          version: 3,
        },
        receipt_ids: [
          '9eXEwiPTv7Tti7F5TM4rdMN6rhwc1J1eYTH7a4YydXP8',
          'Bp38rPVahXfoURfgtAHNKVPqLnbeh79GbWgUw8BuegEL',
        ],
        status: {
          SuccessValue: 'WyIwIl0=',
        },
        tokens_burnt: '220217208537600000000',
      },
      proof: [
        {
          direction: 'Left',
          hash: 'Gar6S85R4eoPwGa2SKJmhnJia3XEJxWHGtYCTAviA73Y',
        },
      ],
    },
    {
      block_hash: '2qSKdK3cFZ9WtyFTN1i8SXPznsAGoWSyd3qp1KpGGoTN',
      id: '9eXEwiPTv7Tti7F5TM4rdMN6rhwc1J1eYTH7a4YydXP8',
      outcome: {
        executor_id: 'v2_1.omni.hot.tg',
        gas_burnt: 4003061326419,
        logs: [
          'EVENT_JSON:{"standard":"nep245","version":"1.0.0","event":"mt_burn","data":[{"owner_id":"bridge-refuel.hot.tg","token_ids":["56_11111111111111111111"],"amounts":["2528550816890741"],"memo":"1777389836000001146850"}]}',
        ],
        metadata: {
          gas_profile: [
            {
              cost: 'NEW_DATA_RECEIPT_BYTE',
              cost_category: 'ACTION_COST',
              gas_used: '1557497424',
            },
            {
              cost: 'BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '14297477994',
            },
            {
              cost: 'CONTRACT_LOADING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '35445963',
            },
            {
              cost: 'CONTRACT_LOADING_BYTES',
              cost_category: 'WASM_HOST_COST',
              gas_used: '967884357890',
            },
            {
              cost: 'LOG_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '3543313050',
            },
            {
              cost: 'LOG_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '2850938856',
            },
            {
              cost: 'READ_CACHED_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '221160000000',
            },
            {
              cost: 'READ_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '91345212000',
            },
            {
              cost: 'READ_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '5166011547',
            },
            {
              cost: 'READ_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '37757477790',
            },
            {
              cost: 'READ_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '62389746',
            },
            {
              cost: 'SHA256_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '18163881000',
            },
            {
              cost: 'SHA256_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '4534061988',
            },
            {
              cost: 'STORAGE_HAS_KEY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '162119689875',
            },
            {
              cost: 'STORAGE_HAS_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '2740385205',
            },
            {
              cost: 'STORAGE_READ_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '563568457490',
            },
            {
              cost: 'STORAGE_READ_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '6500031930',
            },
            {
              cost: 'STORAGE_READ_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '2008739432',
            },
            {
              cost: 'STORAGE_WRITE_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '513573888000',
            },
            {
              cost: 'STORAGE_WRITE_EVICTED_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '10020599784',
            },
            {
              cost: 'STORAGE_WRITE_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '13462227597',
            },
            {
              cost: 'STORAGE_WRITE_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '13679175699',
            },
            {
              cost: 'TOUCHING_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '145920000000',
            },
            {
              cost: 'UTF8_DECODING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '3111779061',
            },
            {
              cost: 'UTF8_DECODING_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '62981383464',
            },
            {
              cost: 'WASM_INSTRUCTION',
              cost_category: 'WASM_HOST_COST',
              gas_used: '133850882616',
            },
            {
              cost: 'WRITE_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '44860717776',
            },
            {
              cost: 'WRITE_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1767728028',
            },
            {
              cost: 'WRITE_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '63041494692',
            },
            {
              cost: 'WRITE_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '3170504376',
            },
          ],
          version: 3,
        },
        receipt_ids: ['CPGJgaBzqA9nzV4gjeu8iqjH5o872iMNpUPTKQVbwn6N'],
        status: {
          SuccessValue: 'IjE3NzczODk4MzYwMDAwMDExNDY4NTAi',
        },
        tokens_burnt: '400306132641900000000',
      },
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
      block_hash: '4xjeuzuKqr9M1gRPcHzW5hr6zCRm7gh4eURXBvUW3csC',
      id: 'CPGJgaBzqA9nzV4gjeu8iqjH5o872iMNpUPTKQVbwn6N',
      outcome: {
        executor_id: 'intents.near',
        gas_burnt: 223182562500,
        logs: [],
        metadata: {
          gas_profile: [],
          version: 3,
        },
        receipt_ids: [],
        status: {
          SuccessValue: '',
        },
        tokens_burnt: '0',
      },
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
      block_hash: '4xjeuzuKqr9M1gRPcHzW5hr6zCRm7gh4eURXBvUW3csC',
      id: 'Bp38rPVahXfoURfgtAHNKVPqLnbeh79GbWgUw8BuegEL',
      outcome: {
        executor_id: 'bridge-refuel.hot.tg',
        gas_burnt: 2213661554147,
        logs: [],
        metadata: {
          gas_profile: [
            {
              cost: 'BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '7943043330',
            },
            {
              cost: 'CONTRACT_LOADING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '35445963',
            },
            {
              cost: 'CONTRACT_LOADING_BYTES',
              cost_category: 'WASM_HOST_COST',
              gas_used: '261112725860',
            },
            {
              cost: 'READ_CACHED_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '177840000000',
            },
            {
              cost: 'READ_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '41757811200',
            },
            {
              cost: 'READ_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1136598567',
            },
            {
              cost: 'READ_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '20137321488',
            },
            {
              cost: 'READ_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '26808864',
            },
            {
              cost: 'SHA256_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '4540970250',
            },
            {
              cost: 'SHA256_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '506464371',
            },
            {
              cost: 'STORAGE_READ_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '281784228745',
            },
            {
              cost: 'STORAGE_READ_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '2104772244',
            },
            {
              cost: 'STORAGE_READ_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '403992288',
            },
            {
              cost: 'STORAGE_WRITE_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '320983680000',
            },
            {
              cost: 'STORAGE_WRITE_EVICTED_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '2312446104',
            },
            {
              cost: 'STORAGE_WRITE_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '4792834956',
            },
            {
              cost: 'STORAGE_WRITE_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '4404632538',
            },
            {
              cost: 'TOUCHING_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '98040000000',
            },
            {
              cost: 'WASM_INSTRUCTION',
              cost_category: 'WASM_HOST_COST',
              gas_used: '37100536308',
            },
            {
              cost: 'WRITE_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '25234153749',
            },
            {
              cost: 'WRITE_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '784446336',
            },
            {
              cost: 'WRITE_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '31520747346',
            },
            {
              cost: 'WRITE_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '821137824',
            },
          ],
          version: 3,
        },
        receipt_ids: ['3FopwNg5SEipqUJ5QLLJ7Mo8VAs6urkbwonBQMCABTaw'],
        status: {
          SuccessValue: '',
        },
        tokens_burnt: '221366155414700000000',
      },
      proof: [
        {
          direction: 'Left',
          hash: 'GiUSgzJD2xt7L1QvBucDMEHgfkVAZ861PcGgd2AsMb6V',
        },
      ],
    },
    {
      block_hash: 'G5qxV6F9VHHXvpeUqCKjsmCYEc2MLDfKqrYVKfQtn7Gi',
      id: '3FopwNg5SEipqUJ5QLLJ7Mo8VAs6urkbwonBQMCABTaw',
      outcome: {
        executor_id: 'intents.near',
        gas_burnt: 223182562500,
        logs: [],
        metadata: {
          gas_profile: [],
          version: 3,
        },
        receipt_ids: [],
        status: {
          SuccessValue: '',
        },
        tokens_burnt: '0',
      },
      proof: [
        {
          direction: 'Right',
          hash: 'AyNCEcByDqWEJu81evKvHuEUf6Pn12ZHst73W9927Z46',
        },
      ],
    },
    {
      block_hash: '2qSKdK3cFZ9WtyFTN1i8SXPznsAGoWSyd3qp1KpGGoTN',
      id: '9y2toHkV81YubmJjELi1hHdRPZk2vZKr92YJqwRuoLZt',
      outcome: {
        executor_id: 'v2_1.omni.hot.tg',
        gas_burnt: 2098230887930,
        logs: [],
        metadata: {
          gas_profile: [
            {
              cost: 'NEW_DATA_RECEIPT_BYTE',
              cost_category: 'ACTION_COST',
              gas_used: '1297914520',
            },
            {
              cost: 'BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '4765825998',
            },
            {
              cost: 'CONTRACT_LOADING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '35445963',
            },
            {
              cost: 'CONTRACT_LOADING_BYTES',
              cost_category: 'WASM_HOST_COST',
              gas_used: '967884357890',
            },
            {
              cost: 'READ_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '10439452800',
            },
            {
              cost: 'READ_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '767869266',
            },
            {
              cost: 'READ_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '12585825930',
            },
            {
              cost: 'READ_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '36763626',
            },
            {
              cost: 'STORAGE_READ_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '56356845749',
            },
            {
              cost: 'STORAGE_READ_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '154762665',
            },
            {
              cost: 'STORAGE_READ_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '965092688',
            },
            {
              cost: 'STORAGE_WRITE_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '64196736000',
            },
            {
              cost: 'STORAGE_WRITE_EVICTED_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '5524176804',
            },
            {
              cost: 'STORAGE_WRITE_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '352414335',
            },
            {
              cost: 'STORAGE_WRITE_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '5335188708',
            },
            {
              cost: 'WASM_INSTRUCTION',
              cost_category: 'WASM_HOST_COST',
              gas_used: '42558699612',
            },
            {
              cost: 'WRITE_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '16822769166',
            },
            {
              cost: 'WRITE_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1059547308',
            },
            {
              cost: 'WRITE_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '17193134916',
            },
            {
              cost: 'WRITE_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1429388064',
            },
          ],
          version: 3,
        },
        receipt_ids: ['CQFdgD2w9UcRnUBmv895pFc9uqrDE7ZVHnNZYojqoeev'],
        status: {
          SuccessValue: 'WyIyNTQxNTUwODE2ODkwNzQxIl0=',
        },
        tokens_burnt: '209823088793000000000',
      },
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
      block_hash: '4xjeuzuKqr9M1gRPcHzW5hr6zCRm7gh4eURXBvUW3csC',
      id: 'CQFdgD2w9UcRnUBmv895pFc9uqrDE7ZVHnNZYojqoeev',
      outcome: {
        executor_id: 'intents.near',
        gas_burnt: 223182562500,
        logs: [],
        metadata: {
          gas_profile: [],
          version: 3,
        },
        receipt_ids: [],
        status: {
          SuccessValue: '',
        },
        tokens_burnt: '0',
      },
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
      block_hash: '4xjeuzuKqr9M1gRPcHzW5hr6zCRm7gh4eURXBvUW3csC',
      id: '4ETSzNP1AzbaKM5VFXbhMrDCiMo7fgffcaTttkqbYWZY',
      outcome: {
        executor_id: 'intents.near',
        gas_burnt: 3038728933290,
        logs: [],
        metadata: {
          gas_profile: [
            {
              cost: 'BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '6619202775',
            },
            {
              cost: 'CONTRACT_LOADING_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '35445963',
            },
            {
              cost: 'CONTRACT_LOADING_BYTES',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1460427610155',
            },
            {
              cost: 'READ_CACHED_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '52440000000',
            },
            {
              cost: 'READ_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '26098632000',
            },
            {
              cost: 'READ_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '3744313005',
            },
            {
              cost: 'READ_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '20137321488',
            },
            {
              cost: 'READ_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '99547620',
            },
            {
              cost: 'SHA256_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '9081940500',
            },
            {
              cost: 'SHA256_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '3617602650',
            },
            {
              cost: 'STORAGE_HAS_KEY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '54039896625',
            },
            {
              cost: 'STORAGE_HAS_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '985307040',
            },
            {
              cost: 'STORAGE_READ_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '112713691498',
            },
            {
              cost: 'STORAGE_READ_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '1145243721',
            },
            {
              cost: 'STORAGE_READ_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '3978201836',
            },
            {
              cost: 'STORAGE_WRITE_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '128393472000',
            },
            {
              cost: 'STORAGE_WRITE_EVICTED_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '22771170663',
            },
            {
              cost: 'STORAGE_WRITE_KEY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '2607866079',
            },
            {
              cost: 'STORAGE_WRITE_VALUE_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '21992144151',
            },
            {
              cost: 'TOUCHING_TRIE_NODE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '79800000000',
            },
            {
              cost: 'WASM_INSTRUCTION',
              cost_category: 'WASM_HOST_COST',
              gas_used: '77057681448',
            },
            {
              cost: 'WRITE_MEMORY_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '25234153749',
            },
            {
              cost: 'WRITE_MEMORY_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '2794590072',
            },
            {
              cost: 'WRITE_REGISTER_BASE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '28655224860',
            },
            {
              cost: 'WRITE_REGISTER_BYTE',
              cost_category: 'WASM_HOST_COST',
              gas_used: '5725155384',
            },
          ],
          version: 3,
        },
        receipt_ids: ['5iiTF4YzjzRoBWkV31V56V2qiLjRF2H3PPKWhzR7zcfL'],
        status: {
          SuccessValue: 'WyIyNTQxNTUwODE2ODkwNzQxIl0=',
        },
        tokens_burnt: '303872893329000000000',
      },
      proof: [
        {
          direction: 'Left',
          hash: '3Pa5cNU5WkaGvaB4ZNgRFH1GmKrzGUiJnsPKFoS8BCHq',
        },
      ],
    },
    {
      block_hash: 'G5qxV6F9VHHXvpeUqCKjsmCYEc2MLDfKqrYVKfQtn7Gi',
      id: '5iiTF4YzjzRoBWkV31V56V2qiLjRF2H3PPKWhzR7zcfL',
      outcome: {
        executor_id: 'intents.near',
        gas_burnt: 223182562500,
        logs: [],
        metadata: {
          gas_profile: [],
          version: 3,
        },
        receipt_ids: [],
        status: {
          SuccessValue: '',
        },
        tokens_burnt: '0',
      },
      proof: [
        {
          direction: 'Left',
          hash: '28aZ14Yb7RJiQFHRb1FhMfePufLjr6E9tjYhSDH13Hup',
        },
      ],
    },
  ],
  status: {
    SuccessValue: '',
  },
  transaction: {
    actions: [
      {
        FunctionCall: {
          args: 'eyJzaWduZWQiOlt7InBheWxvYWQiOnsibWVzc2FnZSI6IntcInNpZ25lcl9pZFwiOlwic29sdmVyLXByaXYtbGlxLm5lYXJcIixcImRlYWRsaW5lXCI6XCIyMDI2LTA0LTI4VDE1OjI0OjE3LjQ0NlpcIixcImludGVudHNcIjpbe1wiaW50ZW50XCI6XCJ0b2tlbl9kaWZmXCIsXCJkaWZmXCI6e1wibmVwMTQxOnNvbC5vbWZ0Lm5lYXJcIjpcIjE4OTk5OTgxXCIsXCJuZXAyNDU6djJfMS5vbW5pLmhvdC50Zzo1Nl8xMTExMTExMTExMTExMTExMTExMVwiOlwiLTI1NDE1NTMzNTg0NDQxMDBcIn19XX0iLCJub25jZSI6InFNRUsrNE1oNVV5L3p1Wkhlbk41eW5SdTVZVlJmYjV5OHpZamg4MUh5U1U9IiwicmVjaXBpZW50IjoiaW50ZW50cy5uZWFyIn0sInB1YmxpY19rZXkiOiJlZDI1NTE5OjJzTjVyRzlIVmNwdVg2eHBESkNMUlhNcTI5M2IxTjlycFZHZG9kTlhYWWFzIiwic2lnbmF0dXJlIjoiZWQyNTUxOTozWEM5RHRpQ0dhNkU3VjlXc05GbXU1TWN1OWlUc0NNb01HdG8xSjVmdVp3RjNNUmtYaGZGVTVBR2c0SkhuZFN6SmM2cGNZN2lrcnNHcFBUZjY5VXczSzdUIiwic3RhbmRhcmQiOiJuZXA0MTMifSx7InBheWxvYWQiOnsibWVzc2FnZSI6IntcImRlYWRsaW5lXCI6XCIyMDI2LTA0LTI4VDE1OjI1OjUzLjk5OVpcIixcImludGVudHNcIjpbe1wiaW50ZW50XCI6XCJ0b2tlbl9kaWZmXCIsXCJkaWZmXCI6e1wibmVwMTQxOnNvbC5vbWZ0Lm5lYXJcIjpcIi0xOTAwMDAwMFwiLFwibmVwMjQ1OnYyXzEub21uaS5ob3QudGc6NTZfMTExMTExMTExMTExMTExMTExMTFcIjpcIjI1NDE1NTA4MTY4OTA3NDFcIn0sXCJyZWZlcnJhbFwiOlwiMWNsaWNrLXJhbmdvXCJ9LHtcImludGVudFwiOlwibXRfd2l0aGRyYXdcIixcInJlY2VpdmVyX2lkXCI6XCJicmlkZ2UtcmVmdWVsLmhvdC50Z1wiLFwiYW1vdW50c1wiOltcIjI1NDE1NTA4MTY4OTA3NDFcIl0sXCJ0b2tlbl9pZHNcIjpbXCI1Nl8xMTExMTExMTExMTExMTExMTExMVwiXSxcInRva2VuXCI6XCJ2Ml8xLm9tbmkuaG90LnRnXCIsXCJtc2dcIjpcIntcXFwicmVjZWl2ZXJfaWRcXFwiOlxcXCIyRVh3N3ljUDZ0YjRZeXFtNldReFRGMXpzTHdSXFxcIixcXFwiYW1vdW50X25hdGl2ZVxcXCI6XFxcIjEzMDAwMDAwMDAwMDAwXFxcIixcXFwiYmxvY2tfbnVtYmVyXFxcIjo5NTE5Mzk5OX1cIixcIm1pbl9nYXNcIjpcIjkxMzAwMDAwMDAwMDAwXCJ9XSxcInNpZ25lcl9pZFwiOlwiNjkzMDcwMDU2MjlkZWJiZDM2MGY1YTU2N2ZlMTUxYTk2ZDNkNjcwODJiZmJlMTc1MjczZmY3ODRlMDk0OTI3ZlwifSIsIm5vbmNlIjoiVmlqMnhnQWxLQkt6d0ttOCs4eU9xaGl3Wm80SFBFcVhlRmx0b2FVcEdyND0iLCJyZWNpcGllbnQiOiJpbnRlbnRzLm5lYXIifSwicHVibGljX2tleSI6ImVkMjU1MTk6ODVjZVdYWERuZTlhaEpVZURKc0wyRUpnMXgyOHRIRkdhWHlVRTlKVzlBcWsiLCJzaWduYXR1cmUiOiJlZDI1NTE5OjRmQUdYczRMWk03NFRnRkczaWh3RHhHbUp3d0xFMzdHUjVNMURUWXdrMlZKckQ3dmRVUDZxQWRBaEhYZ0U3VFBEdnNEaHFyNVNnSFpEVTdkMUdtYXpQOGgiLCJzdGFuZGFyZCI6Im5lcDQxMyJ9XX0=',
          deposit: '0',
          gas: 300000000000000,
          method_name: 'execute_intents',
        },
      },
    ],
    hash: 'HoWytDmLdYF4MnmayBSArwxef6Tj6pDYjnuNCVdSEnXe',
    nonce: 151978851108390,
    priority_fee: 0,
    public_key: 'ed25519:4vq3dbhcG3A1fJufpgMZwa1UKQcnWf3aprFFp916J82Z',
    receiver_id: 'intents.near',
    signature:
      'ed25519:3Rdx1sz4dw19aNeyUuUHzmNHtPWstzPu8cfYZj6tUYtiDnnbf4ZiBUHJ2iaYjxPs3hxS5VgwBxduqNSvWN5zSbj7',
    signer_id: 'intents.near',
  },
  transaction_outcome: {
    block_hash: 'EZoTP1PLsAwE741tzBkBXgbGK3oiv3stW5LzgHiyqj22',
    id: 'HoWytDmLdYF4MnmayBSArwxef6Tj6pDYjnuNCVdSEnXe',
    outcome: {
      executor_id: 'intents.near',
      gas_burnt: 311565444512,
      logs: [],
      metadata: {
        gas_profile: null,
        version: 1,
      },
      receipt_ids: ['z6RxSWKZD7cgpU2sArqTVUQQRLe2mv8z2sJrMHti1uA'],
      status: {
        SuccessReceiptId: 'z6RxSWKZD7cgpU2sArqTVUQQRLe2mv8z2sJrMHti1uA',
      },
      tokens_burnt: '31156544451200000000',
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
};
