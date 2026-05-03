/**
 * Minimal ambient declaration for `nodemailer`.
 *
 * This is only here so TypeScript builds work out-of-the-box. For full
 * IntelliSense, install the official typings:
 *   pnpm add -D @types/nodemailer
 */
declare module "nodemailer" {
    export interface SendMailOptions {
        from?: string;
        to?: string | string[];
        cc?: string | string[];
        bcc?: string | string[];
        replyTo?: string;
        subject?: string;
        text?: string;
        html?: string;
        attachments?: Array<{
            filename?: string;
            content?: string | Buffer;
            path?: string;
            contentType?: string;
        }>;
    }

    export interface SentMessageInfo {
        messageId: string;
        accepted: string[];
        rejected: string[];
        response: string;
    }

    export interface Transporter {
        sendMail(options: SendMailOptions): Promise<SentMessageInfo>;
        verify(): Promise<true>;
        close(): void;
    }

    export interface TransportOptions {
        host?: string;
        port?: number;
        secure?: boolean;
        auth?: { user: string; pass: string };
        service?: string;
        pool?: boolean;
        maxConnections?: number;
        maxMessages?: number;
        tls?: { rejectUnauthorized?: boolean };
    }

    export function createTransport(options: TransportOptions): Transporter;

    const _default: {
        createTransport: typeof createTransport;
    };
    export default _default;
}
