import crypto from 'crypto';


export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


export const generateBoxCode = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

export const generateResetToken = (): string => {
    return Math.random().toString(36).substring(2, 15);
};
