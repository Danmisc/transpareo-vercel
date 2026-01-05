import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Validate Server Env Vars
const PUSHER_APP_ID = process.env.PUSHER_APP_ID;
const PUSHER_KEY = process.env.PUSHER_KEY;
const PUSHER_SECRET = process.env.PUSHER_SECRET;
const PUSHER_CLUSTER = process.env.PUSHER_CLUSTER;

// Server-side Pusher instance
// If keys are missing, we provide a mock object that logs instead of crashing
export const pusherServer = (PUSHER_APP_ID && PUSHER_KEY && PUSHER_SECRET && PUSHER_CLUSTER)
    ? new PusherServer({
        appId: PUSHER_APP_ID,
        key: PUSHER_KEY,
        secret: PUSHER_SECRET,
        cluster: PUSHER_CLUSTER,
        useTLS: true,
    })
    : {
        trigger: async (channel: string, event: string, data: any) => {
            console.warn(`[Mock Pusher Server] Triggered '${event}' on '${channel}'`, data);
            return {} as any;
        },
        authorizeChannel: (socketId: string, channel: string, data: any) => {
            console.warn(`[Mock Pusher Server] Authorizing channel '${channel}'`);
            return {};
        }
    } as unknown as PusherServer;

// Validate Client Env Vars
const NEXT_PUBLIC_PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const NEXT_PUBLIC_PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

// Client-side Pusher instance
export const pusherClient = (NEXT_PUBLIC_PUSHER_KEY && NEXT_PUBLIC_PUSHER_CLUSTER)
    ? new PusherClient(NEXT_PUBLIC_PUSHER_KEY, {
        cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: "/api/pusher/auth",
    })
    : {
        subscribe: (channelName: string) => ({
            bind: (eventName: string, callback: Function) => {
                console.log(`[Mock Pusher Client] Subscribed to '${channelName}' - Listening for '${eventName}'`);
            },
            unbind: () => { },
            trigger: (eventName: string, data: any) => {
                console.log(`[Mock Pusher Client] Triggered '${eventName}' on '${channelName}'`, data);
                return true;
            }
        }),
        unsubscribe: (channelName: string) => {
            console.log(`[Mock Pusher Client] Unsubscribed from '${channelName}'`);
        },
        signin: () => { }
    } as unknown as PusherClient;
