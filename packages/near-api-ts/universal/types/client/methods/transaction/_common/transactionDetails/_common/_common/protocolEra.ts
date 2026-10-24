/**
 * The protocol eras whose data the details of a transaction can hold:
 * - `'Live'` – only what the current protocol produces: the details of a transaction sent now;
 * - `'Live' | 'Legacy'` – also what older protocol versions recorded on chain and the current one
 *   refuses: the details of a transaction read back from the chain.
 *
 * A type that differs by era looks its parts up in a `{ Live: …; Legacy: … }` map by `PE` and keeps
 * `PE` out of every `extends` clause of a conditional type: TS then compares two instantiations by
 * `PE` itself, so `'Live'` details fit where `'Live' | 'Legacy'` ones are expected, and never the
 * other way round. With `PE` in an `extends` clause the two would not fit either way.
 */
export type ProtocolEra = 'Live' | 'Legacy';
