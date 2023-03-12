import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ethers, BigNumber, Contract, Wallet } from 'ethers';

import tokenJson from '../assets/MyToken.json';
import { TransactionResponseDTO, ErrorMessageDTO } from '../dto';

declare global {
  interface Window {
    ethereum: any;
  }
}

const enum API_URLS {
  MY_TOKEN_ADDRESS = 'http://localhost:3000/my-token-contract-address',
  TOKENIZED_BALLOT_ADDRESS = 'http://localhost:3000/tokenized-ballot-contract-address',
  MINTING = 'http://localhost:3000/request-tokens',
  DELEGATING = 'http://localhost:3000/delegate',
  VOTING = 'http://localhost:3000/vote',
  WINNING_PROPOSAL = 'http://localhost:3000/winning-proposal',
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  blockNumber: number | string | undefined;
  provider: ethers.providers.BaseProvider;
  tokenContract: Contract | undefined;
  totalSupply: number | undefined;

  myTokenContractAddress: string | undefined;
  tokenizedBallotContractAddress: string | undefined;

  isWalletConnected = false;
  userWallet: Wallet | undefined;
  userAddress: string | undefined;
  userETHBalance: number | undefined;
  userTokenBalance: string | number | undefined;

  mintingInfo: TransactionResponseDTO | undefined;
  delegatingInfo: TransactionResponseDTO | undefined;
  votingInfo: TransactionResponseDTO |  undefined;
  winningProposalInfo: TransactionResponseDTO |  undefined;

  mintingError: ErrorMessageDTO | undefined;
  delegatingError: ErrorMessageDTO | undefined;
  votingError: ErrorMessageDTO |  undefined;
  winningProposalError: ErrorMessageDTO |  undefined;

  loadingMintingTxnInfo = false;
  loadingDelegatingTxnInfo = false;
  loadingVotingTxnInfo = false;
  loadingWinningProposalTxnInfo = false;

  constructor(private http: HttpClient) {
    this.provider = ethers.providers.getDefaultProvider('goerli');
  }

  getTokenizedBallotContractAddress() {
    this.http
      .get<{ result: string }>(API_URLS.TOKENIZED_BALLOT_ADDRESS)
      .subscribe((answer) => {
        this.tokenizedBallotContractAddress = answer.result
      });
  }

  getMyTokenContractAddress() {
    this.http
      .get<{ result: string }>(API_URLS.MY_TOKEN_ADDRESS)
      .subscribe((answer) => {
        this.myTokenContractAddress = answer.result
        this.getTokenInfo();
      });
  }


  getTokenInfo() {
    if (!this.myTokenContractAddress) return;
    const { abi } = tokenJson;

    this.tokenContract = new Contract(
      this.myTokenContractAddress,
      abi,
      this.userWallet ?? this.provider
    );

    this.tokenContract['totalSupply']().then((totalSupplyBN: BigNumber) => {
      const totalSupplyString = ethers.utils.formatEther(totalSupplyBN);
      const totalSupplyNumber = parseFloat(totalSupplyString);

      this.totalSupply = totalSupplyNumber;
    })
  }

  async connectWallet() {
    if (!window?.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();

    this.userAddress = await signer.getAddress();

    const balanceBN = await signer.getBalance();
    const balanceString = ethers.utils.formatEther(balanceBN);
    const balance = parseFloat(balanceString);
    this.userETHBalance = balance;

    this.isWalletConnected = true;

    this.userTokenBalance = await this.tokenContract?.['balanceOf']?.(this.userAddress) || 'Cannot load the token balance data';
  }

  requestTokens(value: string) {
    const mintValue = Number(value);

    const body = {
      address: this.userAddress,
      amount: mintValue,
    }
    this.loadingMintingTxnInfo = true;

    this.http.post<TransactionResponseDTO | ErrorMessageDTO>(API_URLS.MINTING, body).subscribe((ans) => {
      if ('detailedMessage' in ans) {
        this.mintingError = ans;
        this.mintingInfo = undefined;
      } else {
        this.mintingInfo = ans;
        this.mintingError = undefined;
      }
      this.loadingMintingTxnInfo = false;
    });
  }

  delegate(address: string) {
    const body = {
      delegatee: address,
    }
    this.loadingDelegatingTxnInfo = true;

    this.http.post<TransactionResponseDTO | ErrorMessageDTO>(API_URLS.DELEGATING, body).subscribe((ans) => {
      if ('detailedMessage' in ans) {
        this.delegatingError = ans;
        this.delegatingInfo = undefined;
      } else {
        this.delegatingInfo = ans;
        this.delegatingError = undefined;
      }
      this.loadingDelegatingTxnInfo = false;
    });
  }

  vote(proposalId: string, amount: string) {
    const body = {
      proposalId: proposalId,
      amount: amount
    }
    this.loadingVotingTxnInfo = true;

    this.http.post<TransactionResponseDTO | ErrorMessageDTO>(API_URLS.VOTING, body).subscribe((ans) => {
      if ('detailedMessage' in ans) {
        this.votingError = ans;
        this.votingInfo = undefined;
      } else {
        this.votingInfo = ans;
        this.votingError = undefined;
      }
      this.loadingVotingTxnInfo = false;
    });
  }

  getWinningProposal() {
    this.loadingWinningProposalTxnInfo = true;

    this.http.get<TransactionResponseDTO | ErrorMessageDTO>(API_URLS.WINNING_PROPOSAL).subscribe((ans) => {
      if ('detailedMessage' in ans) {
        this.winningProposalError = ans;
        this.winningProposalInfo = undefined;
      } else {
        this.winningProposalInfo = ans;
        this.winningProposalError = undefined;
      }

      this.loadingWinningProposalTxnInfo = false;
    });
  }
}
