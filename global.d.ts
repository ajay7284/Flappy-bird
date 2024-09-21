// src/types/global.d.ts
declare global {
    interface Window {
      tronWeb?: {
        defaultAddress: {
          base58: string;
        };
        trx: {
          getBalance: (address: string) => Promise<number>;
          fromSun: (sun: number) => number;
        };
        request: (options: { method: string }) => Promise<void>;
      };
    }
  }
  
  // If this file is not a module, make it one
  export {};
  