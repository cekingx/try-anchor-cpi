use anchor_lang::prelude::*;

declare_id!("AFs6h6XWPjoUPHBCrMhWien7Y7Gz188zYx2XaiE6Sfhr");

#[program]
pub mod puppet {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
