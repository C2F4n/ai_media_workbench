type Cue = [offsetMs: number, durationMs: number];
type SoundBank = { buffer: AudioBuffer; cues: Record<string, Cue> };

export function createKeyboardSound() {
  let context: AudioContext | undefined;
  let bank: SoundBank | undefined;
  let loading = false;

  function prepare() {
    if (!window.AudioContext) return;
    const audio = context ??= new AudioContext();
    // 在打开键盘或取消静音的点击中解锁播放。
    void audio.resume().catch(() => {});
    if (bank || loading) return;

    loading = true;
    void Promise.all([
      fetch('/assets/auth/keyboard/config.json').then(response => {
        if (!response.ok) throw new Error('Keyboard timing unavailable');
        return response.json() as Promise<{ defines: Record<string, Cue> }>;
      }),
      fetch('/assets/auth/keyboard/sound.ogg').then(response => {
        if (!response.ok) throw new Error('Keyboard sound unavailable');
        return response.arrayBuffer();
      }).then(bytes => audio.decodeAudioData(bytes)),
    ]).then(([config, buffer]) => {
      if (context === audio) bank = { buffer, cues: config.defines };
    }).catch(() => {
      // 音频不可用时，键盘仍接收输入。
    }).finally(() => { loading = false; });
  }

  function play(code: number, release = false) {
    const cue = bank?.cues[code];
    if (!context || context.state !== 'running' || !bank || !cue) return;
    const [offset, duration] = cue;
    const start = offset + (release ? duration * .54 : 0);
    const length = duration * (release ? .46 : .51);
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = bank.buffer;
    gain.gain.value = release ? .22 : .4;
    source.connect(gain);
    gain.connect(context.destination);
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    source.start(0, start / 1000, length / 1000);
  }

  function dispose() {
    void context?.close().catch(() => {});
    context = undefined;
    bank = undefined;
  }

  return { prepare, play, dispose };
}
