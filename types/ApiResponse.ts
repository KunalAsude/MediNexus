export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean;
    messages?: Array<Message>;
}


export interface Message extends Document{
    content:string;
    createdAt:Date;
}