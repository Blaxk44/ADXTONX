
import { User, AdNetwork } from '../types.ts';

export const calculateAdReward = (user: User, network: AdNetwork): number => {
    if (network === AdNetwork.ADSGRAM) return 0.0035;
    const watched = user.ads_watched || 0;
    if (watched < 400) return 0.005;
    if (watched < 1000) return 0.007;
    return 0.008;
};

export const checkMilestoneBonus = (count: number): number => {
    if (count === 400) return 0.05;
    if (count === 1000) return 0.10;
    return 0;
};

export const triggerAd = async (network: AdNetwork, userId: string, interests?: string[]): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const w = window as any;
        try {
            if (network === AdNetwork.MONETAG) {
                if (typeof w.show_10551237 === 'function') {
                    w.show_10551237().then(() => resolve(true)).catch(() => reject(new Error("Stream Interrupted")));
                } else reject(new Error("Monetag initializing..."));
            } else if (network === AdNetwork.ADSGRAM) {
                if (w.Adsgram) {
                    // We pass custom data if Adsgram block is configured for segments
                    const controller = w.Adsgram.init({ 
                        blockId: "int-22171",
                        // Optional: Pass interests as a string if the block supports custom targeting
                        custom_data: interests?.join(',') 
                    });
                    controller.show().then((res: any) => res?.done ? resolve(true) : reject(new Error("Incomplete watch"))).catch(() => reject(new Error("Ad Load Failed")));
                } else reject(new Error("Adsgram initializing..."));
            } else if (network === AdNetwork.ADEXIUM) {
                if (w.AdexiumWidget) {
                    const widget = new w.AdexiumWidget({ 
                        wid: '593e85f5-6028-4ee2-bf80-f7729b16a482', 
                        adFormat: 'interstitial', 
                        userId,
                        // Passing interests to Adexium as a potential segment parameter
                        params: { interests: interests?.join(',') }
                    });
                    widget.autoMode();
                    setTimeout(() => resolve(true), 12000);
                } else reject(new Error("Adexium initializing..."));
            }
        } catch (e) { reject(new Error("Provider Connection Lost")); }
    });
};

export const playRewardSound = () => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
    } catch {}
};
