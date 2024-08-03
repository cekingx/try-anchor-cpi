import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { Keypair, PublicKey } from "@solana/web3.js"
import { PuppetPda } from "../target/types/puppet_pda"
import { PuppetMasterPda } from "../target/types/puppet_master_pda"
import { expect } from "chai"

describe("puppet", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const puppetProgram = anchor.workspace.PuppetPda as Program<PuppetPda>
  const puppetMasterProgram = anchor.workspace.PuppetMasterPda as Program<PuppetMasterPda>

  const puppetKeypair = Keypair.generate()

  it('Does CPI', async () => {
    const [puppetMasterPDA, puppetMasterBump] = PublicKey.findProgramAddressSync([], puppetMasterProgram.programId)
    console.log('puppetMasterPDA', puppetMasterPDA.toBase58())
    console.log('puppetMasterBump', puppetMasterBump)

    await puppetProgram.methods
      .initialize(puppetMasterPDA)
      .accounts({
        puppet: puppetKeypair.publicKey,
        user: provider.wallet.publicKey
      })
      .signers([puppetKeypair])
      .rpc()

    const account = {
      puppet: puppetKeypair.publicKey,
      puppetProgram: puppetProgram.programId,
      authority: puppetMasterPDA
    }
    await puppetMasterProgram.methods
      .pullStrings(puppetMasterBump, new anchor.BN(1))
      .accounts(account)
      .rpc()

    const puppetAccount = await puppetProgram.account.data.fetch(puppetKeypair.publicKey)
    console.log('puppetAccount', puppetAccount)
  })
})