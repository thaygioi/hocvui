// Sound utility using Web Audio API
// Tạo âm thanh đơn giản không cần file audio

const audioContext = typeof window !== 'undefined' && window.AudioContext 
  ? new (window.AudioContext || (window as any).webkitAudioContext)()
  : null;

// Tạo âm thanh đơn giản
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  if (!audioContext) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn('Could not play sound:', error);
  }
}

// Âm thanh khi chọn đáp án đúng
export function playCorrectSound() {
  if (!audioContext) return;
  
  // Melody vui tươi: C - E - G (C major chord)
  playTone(523.25, 0.1, 'sine', 0.2); // C
  setTimeout(() => playTone(659.25, 0.1, 'sine', 0.2), 100); // E
  setTimeout(() => playTone(783.99, 0.2, 'sine', 0.25), 200); // G
}

// Âm thanh khi chọn đáp án sai
export function playIncorrectSound() {
  if (!audioContext) return;
  
  // Âm thanh nhẹ nhàng, khuyến khích
  playTone(392, 0.15, 'sine', 0.15); // G
  setTimeout(() => playTone(349.23, 0.2, 'sine', 0.15), 150); // F
}

// Âm thanh khi hoàn thành quiz
export function playSuccessSound() {
  if (!audioContext) return;
  
  // Melody chúc mừng: C - E - G - C (octave)
  playTone(523.25, 0.15, 'sine', 0.2); // C
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 150); // E
  setTimeout(() => playTone(783.99, 0.15, 'sine', 0.2), 300); // G
  setTimeout(() => playTone(1046.50, 0.3, 'sine', 0.25), 450); // C (octave)
}

// Âm thanh khi bắt đầu quiz
export function playStartSound() {
  if (!audioContext) return;
  
  // Âm thanh khởi động vui tươi
  playTone(523.25, 0.1, 'sine', 0.2); // C
  setTimeout(() => playTone(659.25, 0.1, 'sine', 0.2), 100); // E
  setTimeout(() => playTone(783.99, 0.15, 'sine', 0.2), 200); // G
}

// Âm thanh khi chuyển câu hỏi
export function playNextQuestionSound() {
  if (!audioContext) return;
  
  // Âm thanh nhẹ nhàng
  playTone(440, 0.1, 'sine', 0.15); // A
}
