import argon2 from 'argon2';
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
    try {
        return await argon2.hash(password);
    } catch {
        return await bcrypt.hash(password, 10);
    }
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    try {
        if (hash.startsWith('$argon2')) {
            return await argon2.verify(hash, password);
        }
        return await bcrypt.compare(password, hash);
    } catch {
        try {
            return await bcrypt.compare(password, hash);
        } catch {
            return false;
        }
    }
}
