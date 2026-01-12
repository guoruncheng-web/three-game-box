/**
 * 游戏音效工具
 * 使用 Web Audio API 生成音效
 */

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmGainNode: GainNode | null = null;
  private bgmPlaying: boolean = false;
  private bgmEnabled: boolean = true;

  constructor() {
    // 延迟初始化 AudioContext（需要用户交互后才能创建）
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBGM();
    } else if (this.bgmEnabled && !this.bgmPlaying) {
      this.startBGM();
    }
  }

  setBGMEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (enabled && this.enabled && !this.bgmPlaying) {
      this.startBGM();
    } else if (!enabled) {
      this.stopBGM();
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.enabled || !this.audioContext) return null;
    
    // 如果 AudioContext 被暂停（需要用户交互），尝试恢复
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    return this.audioContext;
  }

  /**
   * 生成音调
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  /**
   * 点击/选择音效
   */
  playSelect() {
    this.playTone(440, 0.1, 'sine', 0.2);
  }

  /**
   * 匹配成功音效
   */
  playMatch() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // 播放上升音调
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }

  /**
   * 消除音效
   */
  playPop() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // 快速下降的音调
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }

  /**
   * 连击音效
   */
  playCombo(comboCount: number) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // 根据连击数播放不同音调
    const baseFreq = 440;
    const frequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.75, baseFreq * 2];

    frequencies.slice(0, Math.min(comboCount, 5)).forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = ctx.currentTime + index * 0.05;
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  }

  /**
   * 交换失败音效
   */
  playError() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // 低沉的错误音
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }

  /**
   * 胜利音效
   */
  playWin() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // 胜利旋律：C-E-G-C
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = ctx.currentTime + index * 0.15;
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }

  /**
   * 失败音效
   */
  playLose() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // 下降的悲伤音调
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(392, ctx.currentTime); // G4
    oscillator.frequency.exponentialRampToValueAtTime(262, ctx.currentTime + 0.5); // C4

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }

  /**
   * 下落音效
   */
  playDrop() {
    this.playTone(300, 0.08, 'sine', 0.15);
  }

  /**
   * 开始播放背景音乐
   */
  startBGM() {
    if (!this.bgmEnabled || !this.enabled || this.bgmPlaying) return;
    
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.stopBGM(); // 确保先停止之前的音乐

    // 创建主音量控制
    this.bgmGainNode = ctx.createGain();
    this.bgmGainNode.gain.value = 0.12; // 背景音乐音量较低，不干扰游戏
    this.bgmGainNode.connect(ctx.destination);

    this.bgmPlaying = true;

    // 创建一个轻松愉快的旋律循环
    // 使用 C 大调音阶创建简单的旋律
    const melody = [
      { freq: 261.63, duration: 0.4 },  // C4
      { freq: 293.66, duration: 0.4 },  // D4
      { freq: 329.63, duration: 0.4 },   // E4
      { freq: 349.23, duration: 0.4 },  // F4
      { freq: 392.00, duration: 0.6 },   // G4
      { freq: 329.63, duration: 0.4 },  // E4
      { freq: 293.66, duration: 0.4 },  // D4
      { freq: 261.63, duration: 0.6 },  // C4
    ];

    const loopDuration = melody.reduce((sum, note) => sum + note.duration, 0); // 计算总时长
    let scheduleTime = ctx.currentTime;

    const scheduleLoop = () => {
      if (!this.bgmPlaying || !this.bgmGainNode) return;

      let currentTime = scheduleTime;

      melody.forEach((note) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.bgmGainNode!);

        oscillator.type = 'sine';
        oscillator.frequency.value = note.freq;

        // 淡入淡出效果，使音乐更柔和
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.25, currentTime + note.duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + note.duration);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);

        this.bgmOscillators.push(oscillator);
        currentTime += note.duration;
      });

      scheduleTime += loopDuration;

      // 使用 requestAnimationFrame 来更精确地调度下一次循环
      const timeoutId = setTimeout(() => {
        if (this.bgmPlaying) {
          scheduleLoop();
        }
      }, loopDuration * 1000);
    };

    scheduleLoop();
  }

  /**
   * 停止背景音乐
   */
  stopBGM() {
    this.bgmPlaying = false;
    
    // 停止所有振荡器
    this.bgmOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // 忽略已停止的振荡器错误
      }
    });
    this.bgmOscillators = [];

    // 断开增益节点
    if (this.bgmGainNode) {
      try {
        this.bgmGainNode.disconnect();
      } catch (e) {
        // 忽略已断开的节点错误
      }
      this.bgmGainNode = null;
    }
  }

  /**
   * 暂停背景音乐
   */
  pauseBGM() {
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = 0;
    }
  }

  /**
   * 恢复背景音乐
   */
  resumeBGM() {
    if (this.bgmGainNode && this.bgmPlaying) {
      this.bgmGainNode.gain.value = 0.15;
    }
  }
}

// 导出单例
export const soundEffects = new SoundEffects();
