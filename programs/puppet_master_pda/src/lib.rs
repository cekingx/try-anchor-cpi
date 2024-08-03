use anchor_lang::prelude::*;
use puppet_pda::cpi::accounts::SetData;
use puppet_pda::program::PuppetPda;
use puppet_pda::{self, Data};

declare_id!("2kK8TynPyzcc1NrpHihDeU6r48PcxtbBcXXLyin6ZyyH");

#[program]
pub mod puppet_master_pda {
    use super::*;

    pub fn pull_strings(ctx: Context<PullStrings>, bump: u8, data: u64) -> Result<()> {
        let bump = &[bump];
        puppet_pda::cpi::set_data(
            ctx.accounts.set_data_ctx().with_signer(&[&[bump]]),
            data
        )
    }
}

#[derive(Accounts)]
pub struct PullStrings<'info> {
    #[account(mut)]
    pub puppet: Account<'info, Data>,
    pub puppet_program: Program<'info, PuppetPda>,
    /// CHECK: only used as a siging PDA
    pub authority: UncheckedAccount<'info>,
}

impl<'info> PullStrings<'info> {
    pub fn set_data_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SetData<'info>> {
        let cpi_program = self.puppet_program.to_account_info();
        let cpi_account = SetData {
            puppet: self.puppet.to_account_info(),
            authority: self.authority.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_account)
    }
}
