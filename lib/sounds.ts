/**
 * Minimal UI Sound System for RouteFlex
 * Using high-quality, short audio samples.
 */

const SOUND_URLS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Minimal mechanical click
  hover: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Soft UI tick
  startup: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3', // Tech startup hum
  archive: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // Success chime
}

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      Object.entries(SOUND_URLS).forEach(([key, url]) => {
        const audio = new Audio(url)
        audio.preload = 'auto'
        this.sounds.set(key, audio)
      })
    }
  }

  play(key: keyof typeof SOUND_URLS, volume = 0.4) {
    const audio = this.sounds.get(key)
    if (audio) {
      audio.currentTime = 0
      audio.volume = volume
      audio.play().catch(() => {
        // Handle browser autoplay restrictions - usually silent until user interaction
      })
    }
  }
}

export const soundManager = typeof window !== 'undefined' ? new SoundManager() : null
