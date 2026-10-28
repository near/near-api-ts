import type { AccessKey } from '../../../../types/_common/accessKey';
import type { CreateSignerArgs } from '../../../../types/signer/createSigner';
import { toPublicKeyId } from '../../../_common/toPublicKeyId';
import { PublicKeyZodSchema } from '../../../_common/zodSchemas/publicKey';

export const getAllowedAccessKeys = (
  accessKeys: AccessKey[],
  createSignerArgs: CreateSignerArgs,
) => {
  const whitelist = createSignerArgs?.keyPool?.allowedAccessKeys;

  // We are sure that signingKeys contains at least 1 key if present;
  if (!whitelist) return accessKeys;

  // The account refers to its keys by id, so compare the whitelisted keys by id too;
  // createSigner has already validated them
  const set = new Set(
    whitelist.map((publicKey) => toPublicKeyId(PublicKeyZodSchema.parse(publicKey))),
  );
  return accessKeys.filter((key) => set.has(key.publicKeyId));
};
