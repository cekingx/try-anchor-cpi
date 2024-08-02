import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Puppet } from "../target/types/puppet";
import { Keypair } from "@solana/web3.js";
import { PuppetMaster } from "../target/types/puppet_master";
import { expect } from "chai";

describe("puppet", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Puppet as Program<Puppet>;
  const puppetMasterProgram = anchor.workspace.PuppetMaster as Program<PuppetMaster>;
  const storage = Keypair.generate();
  const authority = Keypair.generate();
  const other = Keypair.generate();

  it('Initailize', async () => {
    console.log('storage', storage.publicKey.toBase58());
    console.log('authority', authority.publicKey.toBase58());
    console.log('other', other.publicKey.toBase58());

    const initAccount = {
      puppet: storage.publicKey,
    }

    await program.methods
      .initialize(authority.publicKey)
      .accounts(initAccount)
      .signers([storage])
      .rpc();
  })

  it("Success Without CPI", async () => {
    await program.methods
      .setData(new anchor.BN(1))
      .accounts({
        puppet: storage.publicKey,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc()

    const result = await program.account.data.fetch(storage.publicKey);
    expect(result.data.toNumber()).to.eq(1);
  })

  it("Fail Without CPI", async () => {
    try {
      await program.methods
      .setData(new anchor.BN(2))
      .accounts({
        puppet: storage.publicKey,
        authority: other.publicKey,
      })
      .signers([other])
      .rpc()
    } catch (error) {
      console.log(await error.getLogs())
      expect(error).to.be.instanceOf(Error);
    }
  })

  it("Success CPI", async () => {
    const CPIAccount = {
      puppet: storage.publicKey,
      puppetProgram: program.programId,
      authority: authority.publicKey,
    };
    await puppetMasterProgram.methods
      .pullStrings(new anchor.BN(2))
      .accounts(CPIAccount)
      .signers([authority])
      .rpc()

    const result = await program.account.data.fetch(storage.publicKey);
    expect(result.data.toNumber()).to.eq(2);
  });

  it("Fail CPI", async () => {
    const CPIAccount = {
      puppet: storage.publicKey,
      puppetProgram: program.programId,
      authority: other.publicKey,
    };
    try {
      await puppetMasterProgram.methods
        .pullStrings(new anchor.BN(3))
        .accounts(CPIAccount)
        .signers([other])
        .rpc()
    } catch (error) {
      console.log(await error.getLogs())
      expect(error).to.be.instanceOf(Error);
    }
  })

});
