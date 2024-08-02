import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Puppet } from "../target/types/puppet";
import { Keypair } from "@solana/web3.js";
import { PuppetMaster } from "../target/types/puppet_master";

describe("puppet", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Puppet as Program<Puppet>;
  const puppetMasterProgram = anchor.workspace.PuppetMaster as Program<PuppetMaster>;
  const storage = Keypair.generate();

  it("Does CPI", async () => {
    // Add your test here.
    const initAccount = {
      puppet: storage.publicKey,
    }
    await program.methods
    .initialize()
    .accounts(initAccount)
    .signers([storage])
    .rpc();

    const CPIAccount = {
      puppet: storage.publicKey,
      puppetProgram: program.programId,
    };
    await puppetMasterProgram.methods
      .pullStrings(new anchor.BN(1))
      .accounts(CPIAccount)
      .rpc()

    const result = await program.account.data.fetch(storage.publicKey);
    console.log(result);
  });
});
