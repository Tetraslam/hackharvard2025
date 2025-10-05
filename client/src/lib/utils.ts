import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Audio helpers
const audioCache = new Map<string, HTMLAudioElement>();

export function playSfx(src: string, volume = 0.8) {
	let audio = audioCache.get(src);
	if (!audio) {
		audio = new Audio(src);
		audioCache.set(src, audio);
	}
	audio.currentTime = 0;
	audio.volume = volume;
	void audio.play();
}

let bgmAudio: HTMLAudioElement | null = null;
export function playBgm(src: string, volume = 0.5) {
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
