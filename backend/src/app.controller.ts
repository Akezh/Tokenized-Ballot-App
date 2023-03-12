import {
  Controller,
  Body,
  Get,
  Post,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { AppService } from './app.service';
import { RequestTokenDTO, DelegateDTO, VoteDTO, TransactionResponseDTO, ErrorMessageDTO } from './dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/my-token-contract-address')
  getMyTokenContractAddress(): { result: string } {
    return { result: this.appService.getMyTokenContractAddress() };
  }

  @Get('/tokenized-ballot-contract-address')
  getTokenizedBallotContractAddress(): { result: string } {
    return { result: this.appService.getTokenizedBallotContractAddress() };
  }

  @Get('total-supply')
  getTotalSupply(): Promise<number> {
    return this.appService.getTotalSupply();
  }

  @Get('allowance')
  getAllowance(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<number> {
    return this.appService.getAllowance(from, to);
  }

  @Get('transaction-status/:txnHash')
  getTransactionStatus(@Param('txnHash') txnHash: string): Promise<string> {
    return this.appService.getTransactionStatus(txnHash);
  }

  @Get('transaction-receipt/:txnHash')
  getTransactionReceipt(@Param('txnHash') txnHash: string): Promise<string> {
    return this.appService.getTransactionReceipt(txnHash);
  }

  // Minting
  @ApiBody({ description: 'Example payload (Address, amount)', type: RequestTokenDTO })
  @Post('request-tokens')
  requestTokens(@Body() body: RequestTokenDTO): Promise<TransactionResponseDTO | ErrorMessageDTO> {
    const { address, amount } = body;
    
    return this.appService.requestTokens(address, amount);
  }

  // Delegating
  @ApiBody({ description: 'Example payload (Delegatee Address)', type: DelegateDTO })
  @Post('delegate')
  delegate(@Body() body: DelegateDTO): Promise<TransactionResponseDTO | ErrorMessageDTO> {
    const { delegatee } = body;
    return this.appService.delegate(delegatee);
  }

  // Voting
  @ApiBody({ description: 'Example payload (ProposalId, Amount)', type: VoteDTO })
  @Post('vote')
  vote(@Body() body: VoteDTO): Promise<TransactionResponseDTO | ErrorMessageDTO> {
    const { proposalId, amount } = body;

    return this.appService.vote(proposalId, amount);
  }

  // Getting winning proposal
  @Get('winning-proposal')
  getWinningProposal() : Promise<TransactionResponseDTO | ErrorMessageDTO> {
    return this.appService.getWinningProposal();
  }
}
