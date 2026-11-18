import type { MediaMetadata } from './api/contracts';
import { sizeText } from './plan-format';

const numberText = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 3 });

function bitRateText(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return '未提供';
  if (value >= 1_000_000) return numberText.format(value / 1_000_000) + ' Mbps';
  return numberText.format(value / 1_000) + ' kbps';
}

/** 检测页与编辑页共用字段和单位；历史素材只估算总码率，并明确标注。 */
export function mediaMetadataRows(info: MediaMetadata | null | undefined, sizeBytes?: number): [string, string][] {
  const estimatedBitRate = !info?.bitRate && info?.durationMs && sizeBytes
    ? sizeBytes * 8_000 / info.durationMs : null;
  const rows: [string, string][] = [
    ['时长', info ? (info.durationMs / 1000).toFixed(2) + ' 秒' : '—'],
    ['文件大小', sizeBytes != null ? sizeText(sizeBytes) : '—'],
    ['分辨率', info?.width && info.height ? info.width + ' × ' + info.height : '—'],
    ['封装格式', info?.container?.toUpperCase() || '—'],
    ['视频编码', info?.videoCodec?.toUpperCase() || '—'],
    ['平均帧率', info?.frameRate ? numberText.format(info.frameRate) + ' fps' : '未提供'],
    [estimatedBitRate ? '总码率（估算）' : '总码率', bitRateText(info?.bitRate || estimatedBitRate)],
    ['视频码率', bitRateText(info?.videoBitRate)],
    ['像素格式', info?.pixelFormat || '未提供'],
    ['音轨', info ? info.hasAudio ? info.audioCodec?.toUpperCase() || '有音轨' : '无音轨' : '—']
  ];
  if (info?.hasAudio) {
    const channelNames: Record<number, string> = { 1: '单声道', 2: '双声道' };
    const channels = info.channels ? channelNames[info.channels] || info.channels + ' 声道' : '未提供';
    rows.push(
      ['音频码率', bitRateText(info.audioBitRate)],
      ['采样率', info.sampleRate ? numberText.format(info.sampleRate / 1_000) + ' kHz' : '未提供'],
      ['声道', info.channelLayout ? channels + ' · ' + info.channelLayout : channels]
    );
  }
  return rows;
}
