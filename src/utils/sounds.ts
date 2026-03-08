// Sound utility using Web Audio API
// Tạo âm thanh đơn giản không cần file audio

let audioContext: AudioContext | null = null;

// Khởi tạo AudioContext (lazy initialization)
async function getAudioContext(): Promise<AudioContext | null> {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  
  // Resume nếu bị suspended (do browser policy)
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (error) {
      console.warn('Could not resume audio context:', error);
    }
  }
  
  return audioContext;
}

// Tạo âm thanh đơn giản
async function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  const ctx = await getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Could not play sound:', error);
  }
}

// Âm thanh khi chọn đáp án đúng - Rõ ràng và vui tươi
export function playCorrectSound() {
  // Melody vui tươi và rõ ràng: C - E - G (C major chord) với volume cao hơn
  playTone(523.25, 0.15, 'sine', 0.4); // C - volume cao hơn
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.4), 120); // E
  setTimeout(() => playTone(783.99, 0.25, 'sine', 0.45), 240); // G - dài hơn và to hơn
}

// Âm thanh khi chọn đáp án sai - Rõ ràng nhưng nhẹ nhàng
export function playIncorrectSound() {
  // Âm thanh rõ ràng nhưng nhẹ nhàng, khuyến khích
  // Sử dụng âm trầm hơn để phân biệt với đúng
  playTone(330, 0.2, 'sine', 0.3); // E (octave thấp hơn) - rõ ràng hơn
  setTimeout(() => playTone(293.66, 0.25, 'sine', 0.3), 180); // D - trầm hơn
}

// Âm thanh khi hoàn thành quiz
export function playSuccessSound() {
  // Melody chúc mừng: C - E - G - C (octave) với volume cao hơn
  playTone(523.25, 0.15, 'sine', 0.3); // C
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.3), 150); // E
  setTimeout(() => playTone(783.99, 0.15, 'sine', 0.3), 300); // G
  setTimeout(() => playTone(1046.50, 0.3, 'sine', 0.35), 450); // C (octave)
}

// Âm thanh khi bắt đầu quiz
export function playStartSound() {
  // Âm thanh khởi động vui tươi
  playTone(523.25, 0.1, 'sine', 0.25); // C
  setTimeout(() => playTone(659.25, 0.1, 'sine', 0.25), 100); // E
  setTimeout(() => playTone(783.99, 0.15, 'sine', 0.25), 200); // G
}

// Âm thanh khi chuyển câu hỏi
export function playNextQuestionSound() {
  // Âm thanh nhẹ nhàng
  playTone(440, 0.1, 'sine', 0.2); // A
}
