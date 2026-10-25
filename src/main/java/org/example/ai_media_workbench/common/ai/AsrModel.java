package org.example.ai_media_workbench.common.ai;

import java.util.Arrays;
import org.example.ai_media_workbench.common.exception.BusinessException;
import org.example.ai_media_workbench.common.exception.ErrorCode;

/** 已适配私有音频流和真实句级时间戳的模型；不接受任意模型或跨供应商调用。 */
public enum AsrModel {
    TENCENT_ZH("tencent", "16k_zh", "中文通用 16k", true),
    ALIYUN_QWEN("aliyun", "qwen-audio-3.1-asr-flash-streaming", "千问语音 3.1", true),
    ALIYUN_FUN("aliyun", "fun-asr-realtime", "Fun-ASR · 多语种与方言", false),
    ALIYUN_PARAFORMER("aliyun", "paraformer-realtime-v2", "Paraformer V2 · 常规转写", false);

    private final String provider;
    private final String id;
    private final String displayName;
    private final boolean recommended;
    AsrModel(String provider, String id, String displayName, boolean recommended) {
        this.provider=provider; this.id=id; this.displayName=displayName; this.recommended=recommended;
    }
    public String provider() { return provider; }
    public String id() { return id; }
    public String displayName() { return displayName; }
    public boolean recommended() { return recommended; }

    /** 未指定模型的旧客户端/旧队列任务保持原识别行为。 */
    public static AsrModel resolve(String provider, String id) {
        if (id==null) id="aliyun".equals(provider) ? ALIYUN_PARAFORMER.id : TENCENT_ZH.id;
        String selected=id;
        return Arrays.stream(values()).filter(model -> model.provider.equals(provider) && model.id.equals(selected)).findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_PARAMETERS));
    }
}
