package org.example.ai_media_workbench.service;

import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.function.BooleanSupplier;

/** 只接收已鉴权的受控本地素材，返回真实识别片段；实现不得伪造成功或向日志输出识别原文。 */
public interface SpeechRecognizer {
    List<String> providers(String userId);
    boolean isAvailable(String provider,String userId);
    List<RecognizedSegment> recognize(String provider, Path monoMp3, Duration timeout, BooleanSupplier cancelled,String userId);
    record RecognizedSegment(long startMs, long endMs, String text) {}
}
