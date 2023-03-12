export interface ErrorMessageDTO {
  message: string;
  detailedMessage: string;
}

export interface RequestTokenDTO {
  address: string;
  amount: number;
}

export interface TransactionResponseDTO {
  message: string;
  transactionHash: string;
  etherscanLink: string;
}

export interface DelegateDTO {
  delegatee: string;
}

export interface VoteDTO {
  proposalId: string;
  amount: number;
}
