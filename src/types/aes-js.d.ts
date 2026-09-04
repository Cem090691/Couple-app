// `aes-js` n'a pas de types officiels. Déclaration minimale pour ce
// qu'on utilise réellement (voir src/lib/supabase/secure-store.ts).
declare module 'aes-js' {
  export namespace utils {
    namespace hex {
      function toBytes(hex: string): Uint8Array;
      function fromBytes(bytes: Uint8Array): string;
    }
    namespace utf8 {
      function toBytes(text: string): Uint8Array;
      function fromBytes(bytes: Uint8Array): string;
    }
  }

  export class Counter {
    constructor(initialValue: number);
  }

  export namespace ModeOfOperation {
    class ctr {
      constructor(key: Uint8Array, counter: Counter);
      encrypt(bytes: Uint8Array): Uint8Array;
      decrypt(bytes: Uint8Array): Uint8Array;
    }
  }
}
