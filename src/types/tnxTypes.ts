
export interface TNXLOG {
    id: string;
    date: Date;
    type: 'revenue' | 'expense' | 'transfer' | 'reward';
    amount: number;
    description: string;
}

export const EMPTY_TNXLOG: TNXLOG = {
    id: '',
    date: new Date(),
    type: 'revenue',
    amount: 0,
    description: '',
};