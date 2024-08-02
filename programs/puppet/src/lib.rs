use anchor_lang::prelude::*;

declare_id!("AFs6h6XWPjoUPHBCrMhWien7Y7Gz188zYx2XaiE6Sfhr");

#[program]
pub mod puppet {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, authority: Pubkey) -> Result<()> {
        ctx.accounts.puppet.authority = authority;
        Ok(())
    }

    pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<()> {
        if ctx.accounts.puppet.authority != ctx.accounts.authority.key() {
            panic!("Authority does not match");
        }
        ctx.accounts.puppet.data = data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8 + 32)]
    pub puppet: Account<'info, Data>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Data {
    pub data: u64,
    pub authority: Pubkey,
}