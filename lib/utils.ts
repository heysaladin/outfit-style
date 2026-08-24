import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-para-xs', 'text-para-sm', 'text-para-md', 'text-para-lg', 'text-h1', 'text-h2', 'text-h3', 'text-caption'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
