export type WalletTonProof = {
  tonProof: {
    timestamp: number
    domain: {
      lengthBytes: number
      value: string
    }
    signature: string
    payload: string
  }
  walletAddress: string
  publicKey: string
}
