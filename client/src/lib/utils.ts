import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Audio helpers with mute control
const audioCache = new Map<string, HTMLAudioElement>();
let bgmAudio: HTMLAudioElement | null = null;

const MUTE_KEY = "fireball-muted";

function isMuted(): boolean {
	return localStorage.getItem(MUTE_KEY) === "true";
}

export function setMuted(muted: boolean) {
	localStorage.setItem(MUTE_KEY, String(muted));
	if (muted && bgmAudio) {
		bgmAudio.pause();
	}
}

export function getMuted(): boolean {
	return isMuted();
}

export function playSfx(src: string, volume = 0.8) {
	if (isMuted()) return;
	let audio = audioCache.get(src);
	if (!audio) {
		audio = new Audio(src);
		audioCache.set(src, audio);
	}
	audio.currentTime = 0;
	audio.volume = volume;
	void audio.play();
}

export function playBgm(src: string, volume = 0.5) {
	if (isMuted()) {
		bgmAudio?.pause();
		return;
	}
	if (!bgmAudio || bgmAudio.src !== src) {
		bgmAudio?.pause();
		bgmAudio = new Audio(src);
		bgmAudio.loop = true;
	}
	bgmAudio.volume = volume;
	void bgmAudio.play();
}

export function stopBgm() {
	bgmAudio?.pause();
}
