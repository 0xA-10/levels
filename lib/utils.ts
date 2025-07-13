import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithOptional<T, K extends keyof T> = Omit<T, K> & // everything but K
	Partial<Pick<T, K>>; // K, but optional
