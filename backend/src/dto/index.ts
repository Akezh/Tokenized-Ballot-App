export class ErrorMessageDTO {
    message: string;
    detailedMessage: string;
}

export class RequestTokenDTO {
    address: string;
    amount: number;
}

export class TransactionResponseDTO {
    message: string;
    transactionHash: string;
    etherscanLink: string;
}

export class DelegateDTO {
    delegatee: string;
}

export class VoteDTO { 
    proposalId: string;
    amount: number;
}